import getpass

starting_locals = set(locals())

import asyncio
import uuid

from fastapi_users.password import PasswordHelper

from secret_wiki.db import DB, User
from secret_wiki.models.wiki import Page, Section, SectionPermission, Wiki


def create_user(*args, **kwargs):
    async def create_user_(
        email=None, password=None, is_active=True, is_superuser=False, is_verified=True
    ):
        async with DB() as session:
            session.add(
                User(
                    id=uuid.uuid4(),
                    email=email or input("Email: "),
                    hashed_password=PasswordHelper().hash(
                        password or getpass.getpass("Password: ")
                    ),
                    is_active=is_active,
                    is_superuser=is_superuser,
                    is_verified=is_verified,
                )
            )
            await session.commit()

    return asyncio.run(create_user_(*args, **kwargs))


print(f"Preloaded: {', '.join(sorted(set(locals()) - starting_locals))}")
