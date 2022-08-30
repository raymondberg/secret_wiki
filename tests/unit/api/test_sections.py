import pytest
from fastapi.encoders import jsonable_encoder

from secret_wiki.models.wiki import Section


@pytest.mark.asyncio
async def test_list_sections(client, sections):
    response = await client.get("/api/w/my_wiki/p/page_1/s")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == len(sections)
    assert {d["content"] for d in data} == {s.content for s in sections}


@pytest.mark.asyncio
async def test_list_cannot_list_admin_only_sections(client, admin_only_section):
    response = await client.get("/api/w/my_wiki/p/{pages[0].slug}/s")
    assert response.status_code == 200

    data = response.json()
    assert admin_only_section.id not in {s["id"] for s in data}


@pytest.mark.asyncio
async def test_create_sections(client, pages):
    response = await client.post(
        f"/api/w/my_wiki/p/{pages[0].slug}/s",
        json={
            "content": "Some new content",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"]
    assert data["content"] == "Some new content"

    section = await Section.get(data["id"])
    assert section.content == "Some new content"


@pytest.mark.asyncio
async def test_create_multiple_sections_without_collision(client, pages):
    for _ in range(3):
        response = await client.post(
            f"/api/w/my_wiki/p/{pages[0].slug}/s",
            json={
                "content": "Some new content",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "Some new content"


@pytest.mark.asyncio
async def test_create_sections_without_pages_raises_404(client):
    response = await client.post(
        "/api/w/my_wiki/p/unreal-page/s",
        json={
            "content": "Some new content",
        },
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_sections_with_admin_only(admin_client, user_id, pages):
    response = await admin_client.post(
        f"/api/w/my_wiki/p/{pages[0].slug}/s",
        json={
            "content": "Some new content",
            "is_secret": True,
            "permissions": [
                {
                    "user": str(user_id),
                    "level": "edit",
                }
            ],
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert data["id"]
    assert data["content"] == "Some new content"
    assert data["is_secret"]

    section = await Section.get(data["id"])
    assert section.content == "Some new content"
    assert section.is_secret


@pytest.mark.asyncio
async def test_create_sections_with_admin_only_doesnt_work_without_permissions(client, pages):
    response = await client.post(
        f"/api/w/my_wiki/p/{pages[0].slug}/s",
        json=[
            {
                "content": "Some new content",
                "is_secret": True,
            }
        ],
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_sections(client, db, sections):
    section = sections[0]

    section.content = section.content + "\n\nbut better"
    response = await client.post(
        f"/api/w/my_wiki/p/page_1/s/{section.id}", json=jsonable_encoder(section)
    )
    assert response.status_code == 200

    data = response.json()
    assert data["content"] == section.content

    await db.refresh(section)
    assert section.content == section.content


@pytest.mark.asyncio
async def test_cannot_post_admin_sections(client, admin_only_section):
    response = await client.post(
        f"/api/w/my_wiki/p/page_1/s/{admin_only_section.id}",
        json=jsonable_encoder(admin_only_section),
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_admin_can_post_admin_sections(admin_client, db, admin_only_section):
    response = await admin_client.post(
        f"/api/w/my_wiki/p/page_1/s/{admin_only_section.id}",
        json={"is_secret": False},
    )
    assert response.status_code == 200
    await db.refresh(admin_only_section)

    assert not admin_only_section.is_secret


@pytest.mark.asyncio
async def test_post_sections_can_just_do_section_index(client, db, sections):
    section = sections[0]

    section.content = section.content + "\n\nbut better"
    response = await client.post(
        f"/api/w/my_wiki/p/page_1/s/{section.id}", json={"section_index": 94321}
    )
    assert response.status_code == 200

    data = response.json()
    assert data["section_index"] == 94321

    await db.refresh(section)
    assert section.section_index == 94321


@pytest.mark.asyncio
async def test_delete_section(client, sections):
    section = sections[0]

    response = await client.delete(f"/api/w/my_wiki/p/page_1/s/{section.id}")
    assert response.status_code == 204, f"received {response.status_code}: {response.content}"

    assert await Section.get(section.id) is None
