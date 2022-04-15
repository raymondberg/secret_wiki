import asyncio
import io
from uuid import UUID

import pytest

from secret_wiki.db import User
from secret_wiki.models.wiki import Page, Section, Wiki
from secret_wiki.porter import Importer


async def validate_ids(db, orm_model, ids):
    if asyncio.iscoroutine(orm_model):
        collection = await orm_model
    else:
        collection = (await db.execute(orm_model.all())).scalars().all()

    assert len(collection) == len(ids)
    assert set(x.id for x in collection) == set(ids)


@pytest.mark.asyncio
async def test_import_wikis(db, import_input):
    await Importer(import_input).run()

    await validate_ids(
        db,
        Wiki,
        [
            UUID("dbd873fd-15d5-4924-bd21-904dbb0495a4"),
            UUID("1efe54c3-8697-4e46-85bc-b6dca69dce40"),
        ],
    )

    await validate_ids(
        db,
        Page,
        [
            UUID("ad02e827-89fc-419f-ba2f-8b6aae364bd4"),
            UUID("8119681f-eda6-41ee-8341-f378818db197"),
        ],
    )

    await validate_ids(db, User.all(), [UUID("7151c460-085f-45a5-b329-8bbb4d6ee340")])

    sections = (await db.execute(Section.all())).scalars().unique().all()
    assert set(x.id for x in sections) == set(
        [
            UUID("139bdaef-4321-4754-86d5-13045bc9d8aa"),
            UUID("9e0b439a-ce7d-438f-9ef4-389760a7c8f6"),
        ]
    )
    section = next(
        (s for s in sections if s.id == UUID("139bdaef-4321-4754-86d5-13045bc9d8aa")), None
    )
    assert section

    assert section.permissions[0].user == str(UUID("7151c460-085f-45a5-b329-8bbb4d6ee340"))


# slug: my_wiki


@pytest.fixture
def import_input():
    return io.StringIO(
        """\
pages:
- id: ad02e827-89fc-419f-ba2f-8b6aae364bd4
  is_admin_only: false
  slug: page_1
  title: Page One
  wiki_id: dbd873fd-15d5-4924-bd21-904dbb0495a4
- id: 8119681f-eda6-41ee-8341-f378818db197
  is_admin_only: false
  slug: page_2
  title: Page Two
  wiki_id: dbd873fd-15d5-4924-bd21-904dbb0495a4
sections:
- content: A later section
  id: 139bdaef-4321-4754-86d5-13045bc9d8aa
  is_admin_only: false
  is_secret: false
  page_id: ad02e827-89fc-419f-ba2f-8b6aae364bd4
  permissions:
  - level: edit
    user: 7151c460-085f-45a5-b329-8bbb4d6ee340
  section_index: 5
- content: An earlier section
  id: 9e0b439a-ce7d-438f-9ef4-389760a7c8f6
  is_admin_only: false
  is_secret: false
  page_id: ad02e827-89fc-419f-ba2f-8b6aae364bd4
  permissions: []
  section_index: 2
users:
- email: user@example.com
  id: 7151c460-085f-45a5-b329-8bbb4d6ee340
  is_active: true
  is_superuser: false
  is_verified: false
  oauth_accounts: []
wikis:
- id: dbd873fd-15d5-4924-bd21-904dbb0495a4
  slug: my_wiki
- id: 1efe54c3-8697-4e46-85bc-b6dca69dce40
  slug: your_wiki
"""
    )
