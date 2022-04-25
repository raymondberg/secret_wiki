import pytest
from sqlalchemy import select

from secret_wiki.models.wiki import Page, Section


@pytest.mark.asyncio
async def test_list_all_non_admin_pages(client, pages):
    response = await client.get("/api/w/my_wiki/p")
    assert response.status_code == 200
    data = response.json()

    assert data == [
        {
            "id": str(pages[0].id),
            "slug": "page_1",
            "title": "Page One",
            "wiki_id": str(pages[0].wiki_id),
            "is_secret": False,
        },
        {
            "id": str(pages[1].id),
            "slug": "page_2",
            "title": "Page Two",
            "wiki_id": str(pages[1].wiki_id),
            "is_secret": False,
        },
    ]


@pytest.mark.asyncio
async def test_list_admin_pages_as_admin(admin_client, admin_only_page):
    response = await admin_client.get("/api/w/my_wiki/p")
    assert response.status_code == 200
    data = response.json()

    assert data == [
        {
            "id": str(admin_only_page.id),
            "slug": "admin_only_page",
            "title": "Admin Only Page",
            "wiki_id": str(admin_only_page.wiki_id),
            "is_secret": True,
        },
    ]


@pytest.mark.asyncio
async def test_read_page(client, pages):
    page_one = next(p for p in pages if p.slug == "page_1")
    response = await client.get("/api/w/my_wiki/p/page_1")
    assert response.status_code == 200
    data = response.json()
    assert data == {
        "id": str(page_one.id),
        "slug": "page_1",
        "title": page_one.title,
        "wiki_id": str(page_one.wiki_id),
        "is_secret": False,
    }


@pytest.mark.asyncio
async def test_cannot_read_admin_page(client, admin_only_page):
    response = await client.get(f"/api/w/{admin_only_page.wiki_id}/p/{admin_only_page.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_admin_can_read_admin_page(admin_client, admin_only_page):
    response = await admin_client.get(f"/api/w/my_wiki/p/{admin_only_page.slug}")
    assert response.status_code == 200
    data = response.json()
    assert data == {
        "id": str(admin_only_page.id),
        "slug": admin_only_page.slug,
        "title": admin_only_page.title,
        "wiki_id": str(admin_only_page.wiki_id),
        "is_secret": True,
    }


@pytest.mark.asyncio
async def test_create_page(client, db, wikis):
    response = await client.post(
        f"/api/w/{wikis[0].slug}/p",
        json={"title": "my page", "is_secret": True},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["id"]
    assert data["title"] == "my page"
    assert data["slug"] == "my-page"
    assert data["is_secret"]
    assert data["wiki_id"] == str(wikis[0].id)

    page = await db.execute(select(Page).where(Page.id == data["id"]))
    assert page.scalars().first().title == "my page"


@pytest.mark.asyncio
async def test_update_page(client, db, wikis, pages):
    page = pages[0]
    response = await client.post(
        f"/api/w/{wikis[0].slug}/p/{page.slug}",
        json={"title": "an updated page", "is_secret": True},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["id"]
    assert data["title"] == "an updated page"
    assert data["slug"] == page.slug
    assert data["is_secret"]
    assert data["wiki_id"] == str(wikis[0].id)

    await db.refresh(page)
    assert page.title == "an updated page"
    assert page.is_secret


@pytest.mark.asyncio
async def test_user_cannot_update_admin_only_page(client, wikis, admin_only_page):
    response = await client.post(
        f"/api/w/{wikis[0].slug}/p/{admin_only_page.slug}", json={"title": "an updated page"}
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_admin_can_update_admin_only_page(admin_client, wikis, admin_only_page):
    response = await admin_client.post(
        f"/api/w/{wikis[0].slug}/p/{admin_only_page.slug}", json={"title": "an updated page"}
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_fanout(client, pages, sections):
    ## This is what the fixture starts with
    assert {s.section_index for s in sections} == {2, 5}
    response = await client.post(f"/api/w/my_wiki/p/{pages[0].slug}/fanout")
    assert response.status_code == 200
    data = response.json()

    assert [s["section_index"] for s in data] == [1000, 500500]
    assert [s.section_index for s in await Section.for_page(pages[0])] == [1000, 500500]
