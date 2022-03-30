from typing import List

import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from secret_wiki.api.wiki import current_active_user
from secret_wiki.schemas import User

# pylint: disable=redefined-outer-name


@pytest_asyncio.fixture
async def admin_client(test_app, override_current_active_user):
    test_app.dependency_overrides[current_active_user] = override_current_active_user(
        is_admin=True
    )

    async with AsyncClient(app=test_app, base_url="http://test") as client_:
        yield client_


@pytest_asyncio.fixture
async def client(test_app, override_current_active_user):
    test_app.dependency_overrides[current_active_user] = override_current_active_user()

    async with AsyncClient(app=test_app, base_url="http://test") as client_:
        yield client_


@pytest_asyncio.fixture
def override_current_active_user(user):
    def override_current_active_user_(is_admin=False):
        return lambda: User(email=user[1], is_superuser=is_admin)

    return override_current_active_user_
