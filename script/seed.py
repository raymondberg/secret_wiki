import asyncio
import contextlib
from uuid import uuid4

from fastapi_users.manager import UserNotExists
from sqlalchemy import select

from secret_wiki.api.auth import get_user_manager
from secret_wiki.db import get_async_session, get_user_db
from secret_wiki.models.wiki import Page, Section, SectionPermission, Wiki
from secret_wiki.schemas import PermissionLevel, UserShellCreate

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

    if model in (Wiki, Page, Section) and "id" not in kwargs:
        kwargs["id"] = str(uuid4())
    db.add(model(**kwargs))
    await db.commit()
    model = (await db.execute(query)).scalars().first()
    print(f"Created {model}")
    return model


async def create_all():
    users = [create_user("admin"), create_user("user"), create_user("trusted")]

    async with get_async_session_context() as db:
        wikis = dict(
            lion_king=get_or_create(db, Wiki, slug="Lion King"),
            mulan=get_or_create(db, Wiki, slug="Mulan"),
        )

        mulan = await wikis["mulan"]
        pages = dict(
            mulan=get_or_create(db, Page, wiki_id=mulan.id, slug="mulan", title="Mulan"),
            mushu=get_or_create(db, Page, wiki_id=mulan.id, slug="mushu", title="Mushu (Dragon)"),
        )
        mulan_page = await pages["mulan"]
        mushu = await pages["mushu"]
        sections = dict(
            mulan_intro=get_or_create(
                db,
                Section,
                page_id=mulan_page.id,
                content="## ABOUT\nPing is an awesome fighter",
                section_index=3000,
            ),
            secret=get_or_create(
                db,
                Section,
                page_id=mulan_page.id,
                content="Ping is secretly Mulan in disguise.",
                is_admin_only=True,
                section_index=4000,
            ),
            mushu_intro=get_or_create(
                db,
                Section,
                page_id=mushu.id,
                content="## ABOUT\nHe's a cute little dragon",
                section_index=3000,
            ),
            factoid=get_or_create(
                db,
                Section,
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
                section_index=4000,
            ),
        )

        user = await users[2]
        secret_section = await sections["secret"]
        permissions = dict(
            permissions=get_or_create(
                db,
                SectionPermission,
                section_id=str(secret_section.id),
                user_id=user.id,
                level=PermissionLevel.EDIT,
            ),
        )

    await just_gather(
        *users, *wikis.values(), *pages.values(), *sections.values(), *permissions.values()
    )


if __name__ == "__main__":
    asyncio.run(create_all())
