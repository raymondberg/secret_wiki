import pytest

from secret_wiki.db import User


@pytest.mark.asyncio
async def test_can_get_all_users(user_id):
    db_users = await User.all()
    assert user_id in set(u.id for u in db_users)


@pytest.mark.asyncio
async def test_can_find_user_by_email(user_id):
    db_user = await User.find_by_id(user_id)
    assert db_user.id == user_id
