import pytest

import secret_wiki.schemas as schemas
from secret_wiki.models.wiki import Page


@pytest.mark.asyncio
async def test_can_updatePage(pages):
    page = pages[0]

    page.update(schemas.PageUpdate(title="Dragon", slug="dragon", is_secret=True))

    assert page.title == "Dragon"
    assert page.slug == "dragon"
    assert page.is_secret
