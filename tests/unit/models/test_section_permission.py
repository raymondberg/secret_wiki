import pytest
from sqlalchemy import select

import secret_wiki.schemas.wiki as schemas
from secret_wiki.models.wiki.section import SectionPermission


@pytest.mark.asyncio
async def test_add_user_permisssion_accepts_email(db, user, admin_only_section):
    user_id, user_email = user
    await admin_only_section.add_user_permission(user_email)

    permissions = await admin_only_section.permissions
    assert len(permissions) == 1
    assert permissions[0].user_id == user_id
    assert permissions[0].level == schemas.PermissionLevel.EDIT


# @pytest.mark.asyncio
@pytest.mark.skip("not yet supported")
async def test_set_permissions_maps_users(db, user, admin_only_section):
    user_id, user_email = user
    await admin_only_section.set_permissions(
        db, [schemas.SectionPermission(user=user_email, level="edit")]
    )

    sections = await db.execute(
        select(SectionPermission)
        .where(SectionPermission.user_id == user_id)
        .where(SectionPermission.section_id == admin_only_section.id)
    )
    assert sections.scalars().first().level == schemas.PermissionLevel.EDIT
