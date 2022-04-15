import io

import pytest

from secret_wiki import schemas
from secret_wiki.models.wiki import Wiki
from secret_wiki.porter import Exporter


def bformat(bool_thing):
    return str(bool_thing).lower()


@pytest.mark.asyncio
async def test_export_wikis(db, wikis, pages, sections, user):
    async with db.begin_nested():
        await sections[0].set_permissions(
            schemas.SectionPermission(user=str(user.id), level="edit")
        )
    await db.refresh(sections[0])

    output = io.StringIO("")
    await (Exporter(output).export())

    assert (
        output.getvalue()
        == f"""\
pages:
- id: {pages[0].id}
  is_admin_only: {bformat(pages[0].is_admin_only)}
  slug: {pages[0].slug}
  title: {pages[0].title}
  wiki_id: {pages[0].wiki_id}
- id: {pages[1].id}
  is_admin_only: {bformat(pages[1].is_admin_only)}
  slug: {pages[1].slug}
  title: {pages[1].title}
  wiki_id: {pages[1].wiki_id}
sections:
- content: {sections[0].content}
  id: {sections[0].id}
  is_admin_only: {bformat(sections[0].is_admin_only)}
  is_secret: {bformat(sections[0].is_secret)}
  page_id: {sections[0].page_id}
  permissions:
  - level: edit
    user: {user.id}
  section_index: {sections[0].section_index}
- content: {sections[1].content}
  id: {sections[1].id}
  is_admin_only: {bformat(sections[1].is_admin_only)}
  is_secret: {bformat(sections[1].is_secret)}
  page_id: {sections[1].page_id}
  permissions: []
  section_index: {sections[1].section_index}
users:
- email: {user.email}
  id: {user.id}
  is_active: {bformat(user.is_active)}
  is_superuser: {bformat(user.is_superuser)}
  is_verified: {bformat(user.is_verified)}
  oauth_accounts: []
wikis:
- id: {wikis[0].id}
  slug: {wikis[0].slug}
- id: {wikis[1].id}
  slug: {wikis[1].slug}
"""
    )
