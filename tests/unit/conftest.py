from typing import List
from unittest.mock import Mock, patch

import pytest
import pytest_asyncio
from faker import Faker
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import selectinload, sessionmaker

import secret_wiki.models.wiki as models
from secret_wiki.db import Base, User, get_async_session
from secret_wiki.models.wiki import Page, Section, Wiki

TEST_DB_URL = "sqlite+aiosqlite:///./test.db"

# pylint: disable=redefined-outer-name


@pytest.fixture
def fake():
    return Faker()


@pytest.fixture
def sqlalchemy_logging():
    import logging

    logging.basicConfig()
    engine = logging.getLogger("sqlalchemy.engine")
    engine.setLevel(logging.DEBUG)
    return engine


@pytest_asyncio.fixture
async def engine():
    engine = create_async_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine


@pytest_asyncio.fixture
async def db(engine) -> AsyncSession:
    async_session_maker = sessionmaker(
        engine, autocommit=False, autoflush=False, expire_on_commit=False, class_=AsyncSession
    )
    async with async_session_maker() as session:
        delete_results = [
            session.execute(delete(model))
            for model in [models.Section, models.Page, models.Wiki, User, models.SectionPermission]
        ]
        for result in delete_results:
            out = await result
        await session.commit()
        with patch("secret_wiki.db.AsyncDatabaseSession.session", session):
            yield session


@pytest.fixture
def test_app(override_get_db):
    from secret_wiki.app import app

    app.dependency_overrides[get_async_session] = override_get_db
    yield app


@pytest.fixture
def override_get_db(db):
    def override_get_db_():
        yield db

    return override_get_db_


@pytest_asyncio.fixture
async def pages(db: AsyncSession, wikis: List[Wiki]) -> List[Page]:
    wiki = wikis[0]

    db.add_all(
        [
            Page(wiki_id=wiki.id, id="page_1", title="Page One"),
            Page(wiki_id=wiki.id, id="page_2", title="Page Two"),
        ]
    )
    await db.commit()

    pages = await db.execute(select(Page).where(Page.id.in_({"page_1", "page_2"})))
    return pages.scalars().all()


@pytest_asyncio.fixture
async def admin_only_page(db, wikis):
    wiki = wikis[0]
    page_1 = Page(
        wiki_id=wiki.id,
        id="admin_only_page",
        title="Admin Only Page",
        is_admin_only=True,
    )
    db.add(page_1)
    await db.commit()
    pages = await db.execute(select(Page).where(Page.id == "admin_only_page"))
    return pages.scalars().first()


@pytest_asyncio.fixture
async def sections(db, pages: List[Page]) -> List[Section]:
    page = pages[0]
    query = (
        select(Section).where(Section.wiki_id == page.wiki_id).where(Section.page_id == page.id)
    )

    db.add_all(
        [
            Section(
                wiki_id=page.wiki_id,
                page_id=page.id,
                section_index=5,
                content="A later section",
            ),
            Section(
                wiki_id=page.wiki_id,
                page_id=page.id,
                section_index=2,
                content="An earlier section",
            ),
        ]
    )
    await db.commit()

    sections = await db.execute(query)
    return sections.scalars().unique().all()


@pytest_asyncio.fixture
async def admin_only_section(db, pages: List[Page]) -> Section:
    page = pages[0]
    admin_section = Section(
        id=900,
        wiki_id=page.wiki_id,
        page_id=page.id,
        is_admin_only=True,
        section_index=5,
        content="Admin only section",
    )
    db.add(admin_section)
    await db.commit()
    await db.refresh(admin_section)

    return admin_section


@pytest_asyncio.fixture
async def wikis(db: AsyncSession) -> List[Wiki]:
    db.add_all([Wiki(id="my_wiki"), Wiki(id="your_wiki")])
    await db.commit()

    wikis = await db.execute(select(Wiki).where(Wiki.id.in_({"my_wiki", "your_wiki"})))

    return wikis.scalars().all()


@pytest_asyncio.fixture
async def user(fake, db: AsyncSession) -> User:
    db.add(User(id=fake.uuid4(), email="user@example.com", hashed_password="blah"))
    await db.commit()

    result = await db.execute(select(User.id, User.email).where(User.email == "user@example.com"))
    return result.fetchone()
