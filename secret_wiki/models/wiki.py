from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    Sequence,
    String,
    Text,
)


from sqlalchemy.orm import relationship

from ..db import Base


class Wiki(Base):
    __tablename__ = "wikis"

    id = Column(String, primary_key=True)


class Page(Base):
    __tablename__ = "pages"

    id = Column(String, primary_key=True)
    wiki_id = Column(String, ForeignKey("wikis.id"), primary_key=True)
    title = Column(String)
    is_admin_only = Column(Boolean, default=False)

    @classmethod
    def for_user(cls, db, user, wiki_id=None):
        query = db.query(cls).filter_by(wiki_id=wiki_id)
        if not user.is_superuser:
            query = query.filter_by(is_admin_only=False)
        return query


class Section(Base):
    __tablename__ = "sections"
    __table_args__ = (
        ForeignKeyConstraint(["wiki_id", "page_id"], ["pages.wiki_id", "pages.id"]),
    )

    id = Column(Integer, primary_key=True)
    wiki_id = Column(String, ForeignKey("wikis.id"))
    section_index = Column(Integer, default=5000)
    is_admin_only = Column(Boolean, default=False)
    content = Column(Text)

    page_id = Column(String, ForeignKey("pages.id"))

    @classmethod
    def for_user(cls, db, user, wiki_id=None, page_id=None, section_id=None):
        query = db.query(cls).filter_by(wiki_id=wiki_id, page_id=page_id)
        if section_id is not None:
            query = query.filter_by(id=section_id)
        if not user.is_superuser:
            query = query.filter_by(is_admin_only=False)
        return query

    def update(self, section_update):
        for attr in ("content", "is_admin_only", "section_index"):
            if (value := getattr(section_update, attr)) is not None:
                setattr(self, attr, value)
