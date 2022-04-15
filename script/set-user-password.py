import asyncio
import getpass
import os
import sys

from fastapi_users.password import PasswordHelper
from sqlalchemy import select

from secret_wiki.db import DB, User


async def set_user_password(email: str, password: str):
    async with DB() as session:
        user = (await session.execute(select(User).where(User.email == email))).scalars().first()
        assert user

        user.hashed_password = PasswordHelper().hash(password)
        session.add(user)
        await session.commit()


if __name__ == "__main__":
    username = sys.argv[-1]
    password = os.environ.get("WIKI_PASSWORD") or getpass.getpass(f"Password for {username}: ")

    asyncio.run(set_user_password(username, password))
