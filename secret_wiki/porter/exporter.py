from uuid import UUID

from secret_wiki import schemas
from secret_wiki.db import DB, User
from secret_wiki.models.wiki import Page, Section, Wiki

from .common import Porter


def convert_objects(collection, schema_class):
    return [schema_class.from_orm(o).dict() for o in collection]


async def get_objects(orm_class, schema_class, should_unique=False):
    async with DB() as db:
        result = (await db.execute(orm_class.all())).scalars()
        if should_unique:
            result = result.unique()
        return convert_objects(result.all(), schema_class)


class Exporter(Porter):
    @property
    async def data(self):
        return {
            "users": convert_objects(await User.all(), schemas.User),
            "wikis": await get_objects(Wiki, schemas.Wiki),
            "pages": await get_objects(Page, schemas.Page),
            "sections": await get_objects(Section, schemas.Section, should_unique=True),
        }

    async def run(self):
        return self.yaml.dump(await self.data, self.buffer)
