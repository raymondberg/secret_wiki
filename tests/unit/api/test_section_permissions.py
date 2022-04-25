import pytest
import pytest_asyncio

import secret_wiki.schemas.wiki as schemas
from tests.resources.factories import UserFactory


@pytest_asyncio.fixture
async def users(db):
    users = [UserFactory() for _ in range(2)]
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
async def test_user_informed_of_view_restrictions(db, client, sections, user_id):
    user_included_secret = sections[0]
    async with db.begin_nested():
        user_included_secret.is_secret = True
        db.add(user_included_secret)
    await user_included_secret.set_permissions(
        schemas.SectionPermission(user=str(user_id), level="edit")
    )

    data = await get_section_list(client)
    assert next(s for s in data if s["id"] == str(sections[0].id))["is_secret"]
    assert not next(s for s in data if s["id"] == str(sections[1].id))["is_secret"]


@pytest.mark.skip("not yet supported")
def test_admin_informed_of_edit_permissions(admin_client, sections):
    data = get_section_list(admin_client)
    assert all(d["can_edit_permissions"] for d in data)


@pytest.mark.asyncio
async def test_admin_can_see_permissions_for_all_users(admin_client, permissions):
    data = await get_section_list(admin_client)
    response = await admin_client.get("/api/w/my_wiki/p/page_1/s")

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
async def test_admin_can_set_permissions_for_all_users(
    admin_client, permissions, admin_only_section
):
    assert len(permissions) == 2
    new_permission = permissions[0]
    response = await admin_client.post(
        f"/api/w/my_wiki/p/page_1/s/{admin_only_section.id}",
        json={
            "content": "Some new content",
            "is_secret": True,
            "permissions": [
                {
                    "user": str(new_permission.user),
                    "level": "edit",
                }
            ],
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["is_secret"]
    assert len(data["permissions"]) == 1


@pytest.mark.asyncio
async def test_user_can_see_sections_and_permissions_for_them(
    db, client, user_id, permissions, sections
):
    async with db.begin_nested():
        sections[0].is_secret = True
        sections[1].is_secret = True
        db.add(sections[0])
        db.add(sections[1])

    await sections[0].set_permissions(schemas.SectionPermission(user=str(user_id), level="edit"))
    # This is annoying, but I guess because I mocked the db it's not getting refreshed
    await db.refresh(sections[0])
    data = await get_section_list(client, 1)

    assert data[0]["id"] == str(sections[0].id)
    assert data[0]["permissions"] == [{"user": str(user_id), "level": "edit"}]
