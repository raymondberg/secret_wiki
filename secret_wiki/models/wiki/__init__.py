from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    Sequence,
    String,
    Text,
    select,
)
from sqlalchemy.orm import relationship

from secret_wiki.db import Base

from .section import Section, SectionPermission

# pylint: disable=too-few-public-methods


class Wiki(Base):
    __tablename__ = "wikis"

    id = Column(String, primary_key=True)

    def __str__(self):
        return f"Wiki(id={id})"

    @classmethod
    def all(cls):
        return select(cls)


class Page(Base):
    __tablename__ = "pages"

    id = Column(String, primary_key=True)
    wiki_id = Column(String, ForeignKey("wikis.id"), primary_key=True)
    title = Column(String)
    is_admin_only = Column(Boolean, default=False)

    @classmethod
    def filter(cls, user=None, page_id=None, wiki_id=None):
        query = select(cls).filter_by(wiki_id=wiki_id)
        if not user.is_superuser:
            query = query.filter_by(is_admin_only=False)
        if page_id:
            query = query.filter_by(id=page_id)
        return query.order_by("title")
