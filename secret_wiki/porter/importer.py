import asyncio

from secret_wiki.db import AsyncDatabaseSession, User
from secret_wiki.models.wiki import Page, Section, SectionPermission, Wiki

from .common import Porter


def map_sections(section_dict):
    base = {k: v for k, v in section_dict.items() if k not in ("permissions", "is_secret")}
    base["section_permissions"] = [
        SectionPermission(section_id=section_dict["id"], user_id=s["user"], level="EDIT")
        for s in section_dict.get("permissions", [])
    ]

    return base


def map_users(user_dict):
    base = {k: v for k, v in user_dict.items() if k != "oauth_accounts"}
    base["hashed_password"] = "unreversablehash"
    return base


async def find_or_create(collection, orm_model, should_unique=False, mapper=None):
    session = AsyncDatabaseSession()
    async with session.begin_nested():
        accessor = orm_model.all()
        if asyncio.iscoroutine(accessor):
            existing_objects = await accessor
        else:
            existing_objects = (await session.execute(accessor)).scalars()
            if should_unique:
                existing_objects = existing_objects.unique()
            existing_objects = existing_objects.all()
        for item in collection:
            existing_object = next((x for x in existing_objects if x.id == item["id"]), None)
            if mapper:
                item = mapper(item)
            if existing_object:
                pass
                # update route
            else:
                session.add(orm_model(**item))

                # Special case for section_permissions on section
                section_permissions = item.get("section_permissions", [])
                if section_permissions:
                    session.add_all(section_permissions)


class Importer(Porter):
    def __init__(self, buffer):
        self.buffer = buffer

    async def run(self):
        data = self.yaml.load(self.buffer)
        await find_or_create(data["wikis"], Wiki)
        await find_or_create(data["pages"], Page)
        await find_or_create(data["users"], User, mapper=map_users)
        await find_or_create(data["sections"], Section, should_unique=True, mapper=map_sections)
