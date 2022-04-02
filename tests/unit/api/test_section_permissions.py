import pytest
import pytest_asyncio

import secret_wiki.schemas.wiki as schemas
from secret_wiki.db import User


@pytest_asyncio.fixture
async def users(db, fake):
    users = [User(id=fake.uuid4(), email=fake.email(), hashed_password="blah") for u in range(2)]
    db.add_all(users)
    await db.commit()
    return users


@pytest_asyncio.fixture
async def permissions(db, sections, users):
    permissions = [schemas.SectionPermission(user=u.id, level="edit") for u in users]
    for section in sections:
        await section.set_permissions(*permissions)
        await db.refresh(section)
    return permissions


async def get_section_list(client, expected_count=2):
    response = await client.get("/api/w/my_wiki/p/page_1/s")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == expected_count
    return data


@pytest.mark.asyncio
async def test_user_informed_of_view_restrictions(client, sections, user_id):
    user_included_secret = next(s for s in sections if s.content == "An earlier section")
    await user_included_secret.add_user_permission(id=user_id)

    data = await get_section_list(client)
    assert not next(s for s in data if s["content"] == "A later section")["is_secret"]
    assert next(s for s in data if s["content"] == "An earlier section")["is_secret"]


@pytest.mark.skip("not yet supported")
def test_admin_informed_of_edit_permissions(admin_client):
    data = get_section_list(admin_client)
    assert all(d["can_edit_permissions"] for d in data)


@pytest.mark.asyncio
async def test_admin_can_see_permissions_for_all_users(admin_client, permissions):
    data = await get_section_list(admin_client)

    assert data
    for section in data:
        assert section.get("permissions")
        assert len(section["permissions"]) == len(permissions)
        for permission in permissions:
            assert {
                "user": permission.user,
                "level": permission.level.value,
            } in section["permissions"]


@pytest.mark.asyncio
async def test_user_can_see_sections_and_permissions_for_them(
    client, user_id, permissions, sections
):
    await sections[0].set_permissions(schemas.SectionPermission(user=str(user_id), level="edit"))
    data = await get_section_list(client, 1)

    assert data[0]["id"] == sections[0].id
    assert data[0]["permissions"] == [{"user": str(user_id), "level": "edit"}]
