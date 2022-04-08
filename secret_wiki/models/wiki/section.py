from typing import List

from fastapi_users_db_sqlalchemy.guid import GUID
from sqlalchemy import (
    Boolean,
    Column,
    Enum,
    ForeignKey,
    Integer,
    Text,
    and_,
    or_,
    select,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship

import secret_wiki.schemas.wiki as schemas
from secret_wiki.db import AsyncDatabaseSession, Base, User

from .page import Page
from .wiki import Wiki


class SectionPermission(Base):
    __tablename__ = "section_permissions"

    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(GUID, ForeignKey("user.id", ondelete="CASCADE"), primary_key=True)
    level = Column(Enum(schemas.PermissionLevel), default=schemas.PermissionLevel.EDIT)

    @property
    def user(self):
        return str(self.user_id)


class Section(Base):
    __tablename__ = "sections"

    id = Column(GUID, primary_key=True)
    page_id = Column(GUID, ForeignKey("wikis.id"))
    section_index = Column(Integer, default=5000)
    is_admin_only = Column(Boolean, default=False)
    content = Column(Text)
    section_permissions = relationship("SectionPermission", lazy="joined")

    page_id = Column(GUID, ForeignKey("pages.id"))

    @property
    def permissions(self):
        return self.section_permissions

    @classmethod
    async def get(cls, id):
        session = AsyncDatabaseSession()
        user = await session.execute(select(cls).where(cls.id == id))
        return user.scalars().first()

    @property
    def is_secret(self):
        return self.is_admin_only

    @classmethod
    def filter(cls, user=None, wiki_slug=None, page_slug=None, section_id=None):
        query = select(cls)
        if not (wiki_slug and page_slug) and not section_id:
            raise ValueError("Must specify wiki/page OR section_id")

        if section_id is not None:
            query = query.filter_by(id=section_id)
        elif page_slug:
            query = query.join(Page).where(Page.slug == page_slug)
            if wiki_slug:
                query = query.join(Wiki).where(Wiki.slug == wiki_slug)

        if not user or not user.is_superuser:
            query = query.outerjoin(Section.section_permissions).where(
                or_(
                    Section.is_admin_only == False,
                    and_(
                        SectionPermission.user_id == user.id,
                        SectionPermission.level == schemas.PermissionLevel.EDIT,
                    ),
                )
            )
        return query

    def update(self, section_update):
        for attr in ("content", "is_admin_only", "section_index"):
            if (value := getattr(section_update, attr)) is not None:
                setattr(self, attr, value)

    async def set_permissions(self, *user_permissions: List[schemas.SectionPermission], db=None):
        session = db or AsyncDatabaseSession()
        async with session.begin_nested():
            current_permission_set = set(self.permissions)
            new_permission_set = set(
                SectionPermission(user_id=p.user, level=p.level, section_id=str(self.id))
                for p in user_permissions
            )

            for unwanted_permission in current_permission_set - new_permission_set:
                session.sync_session.delete(unwanted_permission)

            for new_permission in new_permission_set - current_permission_set:
                session.add(new_permission)

            if new_permission_set:
                self.is_admin_only = True
