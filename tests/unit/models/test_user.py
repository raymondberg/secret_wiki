import pytest

from secret_wiki.db import User


@pytest.mark.asyncio
async def test_can_find_user_by_email(user):
    user, user_email = user
    db_user = await User.find_by_email(user_email)
    assert user == db_user.id
