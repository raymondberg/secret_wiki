from uuid import UUID

from ruamel.yaml import YAML
from ruamel.yaml.representer import SafeRepresenter

from secret_wiki import schemas
from secret_wiki.db import AsyncDatabaseSession, User
from secret_wiki.models.wiki import Page, Section, Wiki

yaml = YAML(typ="safe")
yaml.default_flow_style = False


def just_stringify(representer, value):
    return representer.represent_scalar("tag:yaml.org,2002:str", str(value))


def just_enum(representer, value):
    return representer.represent_scalar("tag:yaml.org,2002:str", value.value)


SafeRepresenter.add_representer(UUID, just_stringify)
SafeRepresenter.add_representer(schemas.PermissionLevel, just_enum)


def convert_objects(collection, schema_class):
    return [schema_class.from_orm(o).dict() for o in collection]


async def get_objects(orm_class, schema_class, should_unique=False):
    session = AsyncDatabaseSession()
    result = (await session.execute(orm_class.all())).scalars()
    if should_unique:
        result = result.unique()
    return convert_objects(result.all(), schema_class)


class Exporter:
    def __init__(self, buffer):
        self.buffer = buffer

    @property
    async def data(self):
        return {
            "users": convert_objects(await User.all(), schemas.User),
            "wikis": await get_objects(Wiki, schemas.Wiki),
            "pages": await get_objects(Page, schemas.Page),
            "sections": await get_objects(Section, schemas.Section, should_unique=True),
        }

    async def export(self):
        return yaml.dump(await self.data, self.buffer)
