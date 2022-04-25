import pytest

from secret_wiki.models.wiki.page import Page


@pytest.mark.asyncio
async def test_list_wikis(client, wikis):
    response = await client.get("/api/w")
    assert response.status_code == 200
    data = response.json()
    assert {d["id"] for d in data} == {str(w.id) for w in wikis}
    assert {d["slug"] for d in data} == {w.slug for w in wikis}
    assert {d["name"] for d in data} == {w.name for w in wikis}


@pytest.mark.asyncio
async def test_search_wikis(client, wikis, sections):
    response = await client.get(f"/api/w/{wikis[0].slug}/search?q=section")
    assert response.status_code == 200
    data = response.json()

    assert {d["page_slug"] for d in data} == {
        str((await Page.get(section.page_id)).slug) for section in sections
    }

    assert all("section" in d["excerpt"] for d in data)

    response = await client.get(f"/api/w/{wikis[0].slug}/search?q=gilgamesh")
    assert response.status_code == 200
    assert not response.json()
