from unittest.mock import Mock

import pytest
from sqlalchemy import select

import secret_wiki.schemas.wiki as schemas
from secret_wiki.models.wiki.section import Section, SectionPermission


@pytest.mark.asyncio
async def test_permissions_loads_section_permissions(db, user):
    db.add_all(
        [
            Section(id=1, is_admin_only=True),
            SectionPermission(section_id=1, user_id=user.id),
        ],
    )
    await db.commit()

    section = await Section.get(1)
    assert section.permissions


@pytest.mark.asyncio
async def test_admin_only_section_is_secret(sections, admin_only_section):
    assert not sections[0].is_secret
    assert not sections[1].is_secret
    assert admin_only_section.is_secret


@pytest.mark.asyncio
async def test_add_user_permission_accepts_email(
    user,
    admin_only_section,
):
    user_id, user_email = user
    await admin_only_section.add_user_permission(user_email)

    updated_section = await Section.get(admin_only_section.id)
    permissions = updated_section.permissions
    assert len(permissions) == 1
    assert permissions[0].user_id == user_id
    assert permissions[0].level == schemas.PermissionLevel.EDIT


@pytest.mark.asyncio
async def test_set_permissions_maps_users(db, user, admin_only_section):
    _, user_email = user
    await admin_only_section.set_permissions(
        schemas.SectionPermission(user=user_email, level="edit")
    )

    await db.refresh(admin_only_section)
    assert admin_only_section.permissions
    assert len(admin_only_section.permissions) == 1
    assert admin_only_section.permissions[0].level == schemas.PermissionLevel.EDIT
