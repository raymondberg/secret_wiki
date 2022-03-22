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
    select,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship

import secret_wiki.schemas.wiki as schemas
from secret_wiki.db import AsyncDatabaseSession, Base, User


class SectionPermission(Base):
    __tablename__ = "section_permission"
    __table_args__ = (UniqueConstraint("section_id", "user_id", name="permissions"),)

    id = Column(Integer, primary_key=True)
    section_id = Column(String, ForeignKey("sections.id", ondelete="CASCADE"))
    user_id = Column(GUID, ForeignKey("user.id", ondelete="CASCADE"))
    level = Column(Enum(schemas.PermissionLevel), default=schemas.PermissionLevel.EDIT)


class Section(Base):
    __tablename__ = "sections"
    __table_args__ = (ForeignKeyConstraint(["wiki_id", "page_id"], ["pages.wiki_id", "pages.id"]),)

    id = Column(Integer, primary_key=True)
    wiki_id = Column(String, ForeignKey("wikis.id"))
    section_index = Column(Integer, default=5000)
    is_admin_only = Column(Boolean, default=False)
    content = Column(Text)
    section_permissions = relationship("SectionPermission")

    page_id = Column(String, ForeignKey("pages.id"))

    @property
    async def permissions(self):
        session = AsyncDatabaseSession()
        sections = await session.execute(
            select(SectionPermission).where(SectionPermission.section_id == self.id)
        )
        return sections.scalars().all()

    @classmethod
    def filter(cls, user=None, wiki_id=None, page_id=None, section_id=None):
        query = select(cls).filter_by(wiki_id=wiki_id, page_id=page_id)
        if section_id is not None:
            query = query.filter_by(id=section_id)
        if not user.is_superuser:
            query = query.filter_by(is_admin_only=False)
        return query

    async def add_user_permission(self, email) -> None:
        session = AsyncDatabaseSession()
        user = await User.find_by_email(email)
        session.add(SectionPermission(user_id=user.id, section_id=self.id))
        await session.commit()

    def update(self, section_update):
        for attr in ("content", "is_admin_only", "section_index"):
            if (value := getattr(section_update, attr)) is not None:
                setattr(self, attr, value)

    async def set_permissions(
        self, db: AsyncSession, user_permissions: List[schemas.SectionPermission]
    ):
        userid_by_user = {
            k.email: k.id
            for k in await db.execute(
                select([User.email, User.id]).where(
                    User.email.in_([u.user for u in user_permissions])
                )
            )
        }
        return [
            schemas.SectionPermission(
                user_id=userid_by_user[p.user], level=p.level, section_id=self.id
            )
            for p in user_permissions
            if p.user in userid_by_user
        ]
