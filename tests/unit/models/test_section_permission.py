import uuid

import pytest

import secret_wiki.schemas.wiki as schemas
from secret_wiki.models.wiki.section import Section, SectionPermission


@pytest.mark.asyncio
async def test_permissions_loads_section_permissions(db, user_id):
    section_id = str(uuid.uuid4())
    db.add_all(
        [
            Section(id=section_id, is_admin_only=True),
            SectionPermission(section_id=section_id, user_id=user_id),
        ],
    )
    await db.commit()

    section = await Section.get(str(section_id))
    assert section.permissions


@pytest.mark.asyncio
async def test_admin_only_section_is_secret(sections, admin_only_section):
    assert not sections[0].is_secret
    assert not sections[1].is_secret
    assert admin_only_section.is_secret


@pytest.mark.asyncio
async def test_set_permissions_maps_users(db, user_id, sections):
    admin_only_section = sections[0]
    await admin_only_section.set_permissions(
        schemas.SectionPermission(user=str(user_id), level="edit")
    )

    await db.refresh(admin_only_section)
    assert admin_only_section.permissions
    assert len(admin_only_section.permissions) == 1
    assert admin_only_section.permissions[0].level == schemas.PermissionLevel.EDIT

    await admin_only_section.set_permissions()
    await db.refresh(admin_only_section)
    assert not admin_only_section.permissions
