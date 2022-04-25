import pytest
import pytest_asyncio

import secret_wiki.schemas.wiki as schemas
from secret_wiki.models.wiki.section import Section, SectionPermission
from tests.resources.factories import UserFactory


@pytest_asyncio.fixture
async def other_user(db, fake):
    user = UserFactory()
    db.add(user)
    await db.commit()
    return user


@pytest.mark.asyncio
async def test_filters_is_secret(db, wikis, pages, user, other_user, sections):
    # Can see by default
    query = Section.filter(wiki_slug=wikis[0].slug, page_slug=pages[0].slug, user=user)
    visible_sections = (await db.execute(query)).scalars().unique().all()
    assert len(visible_sections) == 2

    # Can't see is admin only
    sections[0].is_secret = True
    db.add(sections[0])
    await db.commit()
    visible_sections = (await db.execute(query)).scalars().unique().all()
    assert sections[0] not in visible_sections

    # Can't see is admin only when another user has access
    await sections[0].set_permissions(
        schemas.SectionPermission(user=str(other_user.id), level="edit")
    )
    visible_sections = (await db.execute(query)).scalars().unique().all()
    assert sections[0] not in visible_sections

    # CAN see is admin only when user has access
    await sections[0].set_permissions(schemas.SectionPermission(user=str(user.id), level="edit"))
    visible_sections = (await db.execute(query)).scalars().unique().all()
    assert sections[0] in visible_sections


@pytest.mark.asyncio
async def test_for_page(db, pages, sections):
    sections_for_page = sorted(
        [s for s in sections if s.page_id == pages[0].id], key=lambda x: x.section_index
    )
    # Must have some data for valid test
    assert sections_for_page

    assert [s.id for s in await Section.for_page(page=pages[0])] == [
        s.id for s in sections_for_page
    ]
    assert [s.id for s in await Section.for_page(page_id=pages[0].id)] == [
        s.id for s in sections_for_page
    ]

    with pytest.raises(ValueError, match="specify one of"):
        await Section.for_page()
