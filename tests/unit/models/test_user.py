import pytest

from secret_wiki.db import User


@pytest.mark.asyncio
async def test_can_find_user_by_email(user_id):
    db_user = await User.find_by_id(user_id)
    assert db_user.id == user_id
