import uuid
from typing import List
from unittest.mock import MagicMock, Mock, patch

import pytest
import pytest_asyncio
from faker import Faker
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import selectinload, sessionmaker

import secret_wiki.models.wiki as models
from secret_wiki.db import Base, User, async_session, get_async_session
from secret_wiki.models.wiki import Page, Section, Wiki
from tests.resources.factories import PageFactory, SectionFactory, WikiFactory

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
        with patch("secret_wiki.db.async_session", MagicMock(async_session())) as mock:
            mock.return_value.__aenter__.return_value = session
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
    pages = [
        PageFactory(wiki_id=wiki.id, slug="page_1", title="Page One"),
        PageFactory(wiki_id=wiki.id, slug="page_2", title="Page Two"),
    ]
    db.add_all(pages)
    await db.commit()
    await db.refresh(pages[0])
    await db.refresh(pages[1])
    return pages


@pytest_asyncio.fixture
async def admin_only_page(db, wikis):
    wiki = wikis[0]
    admin_only = PageFactory(
        wiki_id=wiki.id,
        slug="admin_only_page",
        title="Admin Only Page",
        is_secret=True,
    )
    db.add(admin_only)
    await db.commit()
    await db.refresh(admin_only)
    return admin_only


@pytest_asyncio.fixture
async def sections(db, pages: List[Page]) -> List[Section]:
    page = pages[0]

    sections = [
        SectionFactory(
            page_id=page.id,
            section_index=5,
        ),
        SectionFactory(
            page_id=page.id,
            section_index=2,
            content="An earlier section",
        ),
    ]
    db.add_all(sections)
    await db.commit()
    return await Section.for_page(page)


@pytest_asyncio.fixture
async def admin_only_section(db, pages: List[Page]) -> Section:
    page = pages[0]
    admin_section = SectionFactory(
        page_id=page.id,
        is_secret=True,
        content="Admin only section",
    )
    db.add(admin_section)
    await db.commit()
    await db.refresh(admin_section)

    return admin_section


@pytest_asyncio.fixture
async def wikis(db: AsyncSession) -> List[Wiki]:
    wikis = [
        WikiFactory(slug="my_wiki", name="My Wiki"),
        WikiFactory(slug="your_wiki", name="Your Wiki"),
    ]
    db.add_all(wikis)
    await db.commit()

    await db.refresh(wikis[0])
    await db.refresh(wikis[1])
    return wikis
    # wikis = await db.execute(
    #     select(Wiki).where(Wiki.slug.in_({"my_wiki", "your_wiki"})).order_by("slug")
    # )

    # return wikis.scalars().all()


@pytest_asyncio.fixture
async def user(fake, db: AsyncSession) -> User:
    db.add(User(id=fake.uuid4(), email="user@example.com", hashed_password="blah"))
    await db.commit()

    result = await db.execute(select(User).where(User.email == "user@example.com"))
    return result.scalars().first()


@pytest.fixture
def user_id(user) -> User:
    return user.id
