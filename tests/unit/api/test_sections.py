import pytest
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select

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
    response = await client.get("/api/w/my_wiki/p/page_1/s")
    assert response.status_code == 200

    data = response.json()
    assert admin_only_section.id not in {s["id"] for s in data}


@pytest.mark.asyncio
async def test_create_sections(client, db):
    response = await client.post(
        "/api/w/my_wiki/p/page_1/s",
        json={
            "content": "Some new content",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Some new content"

    sections = await db.execute(select(Section).filter_by(content="Some new content"))
    assert sections.scalars().first()


@pytest.mark.asyncio
async def test_create_sections_with_admin_only(admin_client, db, user_id):
    response = await admin_client.post(
        "/api/w/my_wiki/p/page_1/s",
        json={
            "content": "Some new content",
            "is_admin_only": True,
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

    assert data["content"] == "Some new content"
    assert data["is_admin_only"]

    sections = await db.execute(
        select(Section).filter_by(content="Some new content", is_admin_only=True)
    )
    assert sections.scalars().first()


@pytest.mark.asyncio
async def test_create_sections_with_admin_only_doesnt_work_without_permissions(client, db):
    response = await client.post(
        "/api/w/my_wiki/p/page_1/s",
        json=[
            {
                "content": "Some new content",
                "is_admin_only": True,
            }
        ],
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_post_sections(client, db, sections):
    section = sections[0]

    section.content = section.content + "\n\nbut better"
    response = await client.post(
        f"/api/w/my_wiki/p/page_1/s/{section.id}", json=jsonable_encoder(section)
    )
    assert response.status_code == 200

    data = response.json()
    assert data["content"] == section.content

    sections = await db.execute(select(Section).filter_by(id=section.id))
    assert sections.scalars().first().content == section.content


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
        json={"is_admin_only": False},
    )
    assert response.status_code == 200

    sections = await db.execute(select(Section).filter_by(id=admin_only_section.id))
    assert not sections.scalars().first().is_admin_only


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

    sections = await db.execute(select(Section).filter_by(id=section.id))
    assert sections.scalars().first().section_index == 94321
