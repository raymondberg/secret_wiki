import pytest
from fastapi.encoders import jsonable_encoder

from secret_wiki.models.wiki import Page, Section, Wiki


@pytest.fixture
def users(db):
    return []


@pytest.fixture
def permissions(db, sections, users):
    return []


async def get_section_list(client, expected_count=2):
    response = await client.get("/api/w/my_wiki/p/page_1/s")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == expected_count
    return data


@pytest.mark.asyncio
async def test_user_informed_of_view_restrictions(client, sections, user):
    _, user_email = user
    user_included_secret = next(s for s in sections if s.content == "An earlier section")
    await user_included_secret.add_user_permission(email=user_email)

    data = await get_section_list(client)
    assert not next(s for s in data if s["content"] == "A later section")["is_secret"]
    assert next(s for s in data if s["content"] == "An earlier section")["is_secret"]


@pytest.mark.skip("not yet supported")
def test_admin_informed_of_edit_permissions(admin_client):
    data = get_section_list(admin_client)
    assert all([d["can_edit_permissions"] for d in data])


# @pytest.mark.asyncio
@pytest.mark.skip("not yet supported")
async def test_admin_can_see_permissions_for_all_users(admin_client, permissions):
    data = await get_section_list(admin_client)

    assert data[0]["permissions"] == [
        {"username": p.username, "level": p.level} for p in permissions
    ]
    # "aaaaaaaa-e09c-484d-8b7e-b2d90e6c08dc": {
    #     "username": "test-user@example.com",
    #     "has_access": True,
    # },
    # "bbbbbbbb-e09c-484d-8b7e-b2d90e6c08dc": {
    #     "username": "test-user@example.com",
    #     "has_access": True,
    # },


@pytest.mark.skip("not yet supported")
def test_user_can_see_sections_and_permissions_for_them(client, permissions):
    data = get_section_list(client)

    data[0]
