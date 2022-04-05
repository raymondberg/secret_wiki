import pytest


@pytest.mark.asyncio
async def test_list_users(client, user):
    response = await client.get("/api/u")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == str(user.id)
