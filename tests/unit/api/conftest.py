from typing import List

import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from secret_wiki.api.wiki import current_active_user
from secret_wiki.models.wiki import Page, Section, Wiki
from secret_wiki.schemas import User

# pylint: disable=redefined-outer-name


@pytest_asyncio.fixture
async def admin_client(test_app, override_current_active_user):
    test_app.dependency_overrides[current_active_user] = override_current_active_user(
        is_admin=True
    )

    async with AsyncClient(app=test_app, base_url="http://test") as client_:
        yield client_


@pytest_asyncio.fixture
async def client(test_app, override_current_active_user):
    test_app.dependency_overrides[current_active_user] = override_current_active_user()

    async with AsyncClient(app=test_app, base_url="http://test") as client_:
        yield client_


@pytest_asyncio.fixture
def override_current_active_user():
    def override_current_active_user_(is_admin=False):
        return lambda: User(email="test-user@example.com", is_superuser=is_admin)

    return override_current_active_user_


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
    return sections.scalars().all()


@pytest_asyncio.fixture
async def admin_only_section(db, pages: List[Page]) -> Section:
    page = pages[0]
    query = select(Section).where(Section.wiki_id == page.wiki_id, Section.page_id == page.id)

    admin_section = Section(
        wiki_id=page.wiki_id,
        page_id=page.id,
        is_admin_only=True,
        section_index=5,
        content="Admin only section",
    )
    db.add(admin_section)
    await db.commit()

    sections = await db.execute(query)
    return sections.scalars().first()


@pytest_asyncio.fixture
async def wikis(db: AsyncSession) -> List[Wiki]:
    db.add_all([Wiki(id="my_wiki"), Wiki(id="your_wiki")])
    await db.commit()

    wikis = await db.execute(select(Wiki).where(Wiki.id.in_({"my_wiki", "your_wiki"})))

    return wikis.scalars().all()
