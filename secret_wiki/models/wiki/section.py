from typing import List
from uuid import UUID

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
from secret_wiki.db import DB, Base, User

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

    def __repr__(self):
        return "SectionPermission({})".format(
            dict(zip(("section_id", "user_id", "level"), self._key))
        )

    @property
    def _key(self):
        return (self.section_id, self.user_id, self.level)

    def __eq__(self, other):
        return self._key == other._key

    def __hash__(self):
        return hash(self._key)


class Section(Base):
    __tablename__ = "sections"

    id = Column(GUID, primary_key=True)
    page_id = Column(GUID, ForeignKey("wikis.id"))
    section_index = Column(Integer, default=5000)
    is_secret = Column(Boolean, default=False)
    content = Column(Text)
    section_permissions = relationship("SectionPermission", lazy="joined")

    page_id = Column(GUID, ForeignKey("pages.id"))

    @classmethod
    def all(cls):
        return select(cls).order_by(cls.section_index)

    @property
    def permissions(self):
        return self.section_permissions

    @classmethod
    async def get(cls, id, db=None):
        """There has to be a better way"""
        if db:
            user = await db.execute(select(cls).where(cls.id == id))
            return user.scalars().first()
        async with DB() as db:
            user = await db.execute(select(cls).where(cls.id == id))
            return user.scalars().first()

    @classmethod
    async def for_page(cls, page=None, page_id=None):
        if not page and not page_id:
            raise ValueError("Must specify one of page or page_id")
        elif page:
            page_id = page.id

        async with DB() as db:
            sections = await db.execute(
                select(cls).where(cls.page_id == page_id).order_by("section_index")
            )
            return sections.scalars().unique().all()

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

        query = query.outerjoin(Section.section_permissions).where(
            cls.user_has_permission_to_section(user)
        )
        return query

    @classmethod
    def user_has_permission_to_section(cls, user):
        return or_(
            user.is_superuser,
            cls.is_secret == False,
            and_(
                SectionPermission.user_id == user.id,
                SectionPermission.level == schemas.PermissionLevel.EDIT,
            ),
        )

    def update(self, section_update):
        for attr in ("content", "is_secret", "section_index"):
            if (value := getattr(section_update, attr)) is not None:
                setattr(self, attr, value)

    async def set_permissions(self, *user_permissions: List[schemas.SectionPermission]):
        """
        is_secret: false -> Public (permissions don't matter)
        is_secret: true -> Private (permissions are exclusions {})
        is_secret: true -> Private (permissions are exclusions {user:, access:})

        """
        async with DB() as session:
            async with session.begin_nested():
                current_permission_set = set(self.permissions)
                new_permission_set = set(
                    SectionPermission(user_id=UUID(p.user), level=p.level, section_id=str(self.id))
                    for p in user_permissions
                )

                for unwanted_permission in current_permission_set - new_permission_set:
                    session.sync_session.delete(unwanted_permission)

                for new_permission in new_permission_set - current_permission_set:
                    session.add(new_permission)
