import asyncio
starting_locals = set(locals())

from secret_wiki.api.auth import fastapi_users
from secret_wiki.db import get_db
from secret_wiki.models import Wiki, Page, Section
from secret_wiki.schemas import UserShellCreate

def create_user(*args, **kwargs):
    async def create_user_(email, password, is_active=False, is_superuser=False, is_verified=True):
        return await fastapi_users.create_user(
            UserShellCreate(
                email=email,
                password=password,
                is_active=is_active,
                is_superuser=is_superuser,
                is_verified=is_verified,
            )
        )
    return asyncio.run(create_user_(*args, **kwargs))

db = next(get_db())

print(f"Preloaded: {', '.join(sorted(set(locals()) - starting_locals))}")
