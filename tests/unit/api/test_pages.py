import pytest
from sqlalchemy import select

from secret_wiki.models.wiki import Page


@pytest.mark.asyncio
async def test_list_all_non_admin_pages(client, pages):
    response = await client.get("/api/w/my_wiki/p")
    assert response.status_code == 200
    data = response.json()

    assert {p.id for p in pages} == {d["id"] for d in data}
    assert data == [
        {
            "id": "page_1",
            "title": "Page One",
            "wiki_id": "my_wiki",
            "is_admin_only": False,
        },
        {
            "id": "page_2",
            "title": "Page Two",
            "wiki_id": "my_wiki",
            "is_admin_only": False,
        },
    ]


@pytest.mark.asyncio
async def test_list_admin_pages_as_admin(admin_client, admin_only_page):
    response = await admin_client.get("/api/w/my_wiki/p")
    assert response.status_code == 200
    data = response.json()

    assert data == [
        {
            "id": admin_only_page.id,
            "title": "Admin Only Page",
            "wiki_id": "my_wiki",
            "is_admin_only": True,
        },
    ]


@pytest.mark.asyncio
async def test_read_page(client, pages):
    page_one = next(p for p in pages if p.id == "page_1")
    response = await client.get(f"/api/w/my_wiki/p/{page_one.id}")
    assert response.status_code == 200
    data = response.json()
    assert data == {
        "id": page_one.id,
        "title": page_one.title,
        "wiki_id": "my_wiki",
        "is_admin_only": False,
    }


@pytest.mark.asyncio
async def test_cannot_read_admin_page(client, admin_only_page):
    response = await client.get(f"/api/w/{admin_only_page.wiki_id}/p/{admin_only_page.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_admin_can_read_admin_page(admin_client, admin_only_page):
    response = await admin_client.get(f"/api/w/{admin_only_page.wiki_id}/p/{admin_only_page.id}")
    assert response.status_code == 200
    data = response.json()
    assert data == {
        "id": admin_only_page.id,
        "title": admin_only_page.title,
        "wiki_id": admin_only_page.wiki_id,
        "is_admin_only": True,
    }


@pytest.mark.asyncio
async def test_create_page(client, db):
    response = await client.post(
        "/api/w/my_wiki/p",
        json={"id": "my_page", "title": "my page", "is_admin_only": True},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["id"] == "my_page"
    assert data["title"] == "my page"
    assert data["is_admin_only"]

    page = await db.execute(select(Page).where(Page.id == "my_page"))
    assert page.scalars().first().title == "my page"
