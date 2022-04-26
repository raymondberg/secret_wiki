import pytest

from secret_wiki import schemas
from secret_wiki.models.wiki import Page, Section
from tests.resources.factories import SectionFactory


@pytest.mark.asyncio
async def test_can_updatePage(pages):
    page = pages[0]

    page.update(
        schemas.PageUpdate(
            title="Dragon", slug="dragon", is_secret=True, parent_page_id=pages[1].id
        )
    )

    assert page.title == "Dragon"
    assert page.slug == "dragon"
    assert page.parent_page_id == pages[1].id
    assert page.is_secret

    page.update(schemas.PageUpdate(title="Dragon"))

    assert page.parent_page_id is None


@pytest.mark.asyncio
async def test_fanout(db, pages):
    page = pages[0]
    db.add_all([SectionFactory(page_id=page.id, section_index=50) for _ in range(10)])
    await db.commit()

    await page.fanout()
    assert [s.section_index for s in await Section.for_page(page)] == [
        1000,
        100900,
        200800,
        300700,
        400600,
        500500,
        600400,
        700300,
        800200,
        900100,
    ]
