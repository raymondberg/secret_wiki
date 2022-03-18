import asyncio
import contextlib

from fastapi_users.manager import UserNotExists
from sqlalchemy import select

from secret_wiki.api.auth import get_user_manager
from secret_wiki.db import get_async_session, get_user_db
from secret_wiki.models.wiki import Page, Section, Wiki
from secret_wiki.schemas import UserShellCreate

get_async_session_context = contextlib.asynccontextmanager(get_async_session)
get_user_db_context = contextlib.asynccontextmanager(get_user_db)
get_user_manager_context = contextlib.asynccontextmanager(get_user_manager)


async def create_user(name: str):
    email = f"{name}@example.com"
    async with get_async_session_context() as db:
        async with get_user_db_context(db) as user_db:
            async with get_user_manager_context(user_db) as user_manager:
                try:
                    user = await user_manager.get_by_email(email)
                except UserNotExists:
                    user = await user_manager.create(
                        UserShellCreate(
                            email=email,
                            password=name,
                            is_active=True,
                            is_superuser=name == "admin",
                            is_verified=True,
                        )
                    )
                return user


async def just_gather(*coroutines):
    for cor in coroutines:
        try:
            await cor
        except RuntimeError:
            pass


async def get_or_create(db, model, **kwargs):
    query = select(model).filter_by(**kwargs)
    result = await db.execute(query)
    if record := result.scalars().first():
        return record

    db.add(model(**kwargs))
    await db.commit()
    model = (await db.execute(query)).scalars().first()
    print(f"Created {model}")
    return model


async def create_all():
    users = [create_user("admin"), create_user("user")]

    async with get_async_session_context() as db:
        wikis = dict(
            lion_king=get_or_create(db, Wiki, id="Lion King"),
            mulan=get_or_create(db, Wiki, id="Mulan"),
        )

        mulan = await wikis["mulan"]
        pages = dict(
            mulan=get_or_create(db, Page, wiki_id=mulan.id, id="mulan", title="Mulan"),
            mushu=get_or_create(db, Page, wiki_id=mulan.id, id="mushu", title="Mushu (Dragon)"),
        )

        mushu = await pages["mushu"]
        sections = dict(
            intro=get_or_create(
                db,
                Section,
                wiki_id=mulan.id,
                page_id=mushu.id,
                content="## ABOUT\nHe's a cute little dragon",
            ),
            factoid=get_or_create(
                db,
                Section,
                wiki_id=mulan.id,
                page_id=mushu.id,
                content="\n".join(
                    [
                        "## Facts",
                        "* Voiced by a famous person",
                        "* Red...I think",
                        "* Has 4 legs",
                        "* Very cowardly, but improves over the film",
                    ]
                ),
            ),
        )

    await just_gather(*users, *wikis.values(), *pages.values(), *sections.values())


if __name__ == "__main__":
    asyncio.run(create_all())
