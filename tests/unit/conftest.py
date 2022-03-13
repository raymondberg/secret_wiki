import pytest
import pytest_asyncio
from sqlalchemy import create_engine, delete
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

import secret_wiki.models.wiki as models
from secret_wiki.db import Base, get_async_session

TEST_DB_URL = "sqlite+aiosqlite:///./test.db"

# pylint: disable=redefined-outer-name


@pytest_asyncio.fixture
async def engine():
    engine = create_async_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine


@pytest_asyncio.fixture
async def db(engine) -> AsyncSession:
    async_session_maker = sessionmaker(
        engine, autocommit=False, autoflush=False, class_=AsyncSession
    )
    async with async_session_maker() as session:
        delete_results = [
            session.execute(delete(model)) for model in [models.Section, models.Page, models.Wiki]
        ]
        for result in delete_results:
            await result
        await session.commit()
        yield session


@pytest.fixture
def test_app(override_get_db):
    # with patch.dict('secret_wiki.db.os.environ',
    # {"DATABASE_URL": "sqlite:///./database-test.db"}):
    from secret_wiki.app import app

    app.dependency_overrides[get_async_session] = override_get_db
    yield app


@pytest.fixture
def override_get_db(db):
    def override_get_db_():
        yield db

    return override_get_db_
