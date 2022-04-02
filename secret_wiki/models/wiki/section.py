from typing import List

from fastapi_users_db_sqlalchemy.guid import GUID
from sqlalchemy import (
    Boolean,
    Column,
    Enum,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    String,
    Text,
    UniqueConstraint,
    and_,
    or_,
    select,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship, selectinload

import secret_wiki.schemas.wiki as schemas
from secret_wiki.db import AsyncDatabaseSession, Base, User


class SectionPermission(Base):
    __tablename__ = "section_permission"
    __table_args__ = (UniqueConstraint("section_id", "user_id", name="permissions"),)

    id = Column(Integer, primary_key=True)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"))
    user_id = Column(GUID, ForeignKey("user.id", ondelete="CASCADE"))
    level = Column(Enum(schemas.PermissionLevel), default=schemas.PermissionLevel.EDIT)

    @property
    def user(self):
        return str(self.user_id)


class Section(Base):
    __tablename__ = "sections"
    __table_args__ = (ForeignKeyConstraint(["wiki_id", "page_id"], ["pages.wiki_id", "pages.id"]),)

    id = Column(Integer, primary_key=True)
    wiki_id = Column(String, ForeignKey("wikis.id"))
    section_index = Column(Integer, default=5000)
    is_admin_only = Column(Boolean, default=False)
    content = Column(Text)
    section_permissions = relationship("SectionPermission", lazy="joined")

    page_id = Column(String, ForeignKey("pages.id"))

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
    def filter(cls, user=None, wiki_id=None, page_id=None, section_id=None):
        query = select(cls)
        if wiki_id:
            query = query.filter_by(wiki_id=wiki_id)
        if page_id:
            query = query.filter_by(page_id=page_id)
        if section_id is not None:
            query = query.filter_by(id=section_id)
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

    async def add_user_permission(self, id) -> None:
        user = await User.find_by_id(id)
        if not user:
            raise ValueError(f"Could not find user with id {id}")
        session = AsyncDatabaseSession()
        session.add(SectionPermission(user_id=user.id, section_id=self.id))
        self.is_admin_only = True
        session.add(self)
        await session.commit()
        await session.refresh(self)

    def update(self, section_update):
        for attr in ("content", "is_admin_only", "section_index"):
            if (value := getattr(section_update, attr)) is not None:
                setattr(self, attr, value)

    async def set_permissions(self, *user_permissions: List[schemas.SectionPermission]):
        session = AsyncDatabaseSession()
        async with session.begin_nested():
            current_permission_set = set(self.permissions)
            new_permission_set = set(
                SectionPermission(user_id=p.user, level=p.level, section_id=self.id)
                for p in user_permissions
            )

            for unwanted_permission in current_permission_set - new_permission_set:
                session.sync_session.delete(unwanted_permission)

            for new_permission in new_permission_set - current_permission_set:
                session.add(new_permission)

            self.is_admin_only = True
            session.add(self)
        await session.refresh(self)
