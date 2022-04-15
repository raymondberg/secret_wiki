from fastapi_users_db_sqlalchemy.guid import GUID
from sqlalchemy import Boolean, Column, ForeignKey, String, select

from secret_wiki.db import Base

from .wiki import Wiki


class Page(Base):
    __tablename__ = "pages"

    id = Column(GUID, primary_key=True)
    wiki_id = Column(GUID, ForeignKey("wikis.id"))
    slug = Column(String, unique=True)
    title = Column(String)
    is_admin_only = Column(Boolean, default=False)

    @classmethod
    def all(cls):
        return select(cls)

    def update(self, section_update):
        for attr in ("title", "slug", "is_admin_only"):
            if (value := getattr(section_update, attr)) is not None:
                setattr(self, attr, value)

    @classmethod
    def filter(cls, user=None, page_id=None, wiki_id=None, wiki_slug=None, page_slug=None):
        if not (wiki_id or wiki_slug) and not page_id:
            raise ValueError("Must specify either wiki_id/wiki_slug OR page_id")

        query = select(cls)
        if wiki_id:
            query = query.filter_by(wiki_id=wiki_id)
        if wiki_slug:
            query = query.join(Wiki).where(Wiki.slug == wiki_slug)
        if not user.is_superuser:
            query = query.where(
                Page.is_admin_only == False  # pylint: disable=singleton-comparison
            )
        if page_id:
            query = query.where(Page.id == page_id)
        if page_slug:
            query = query.where(Page.slug == page_slug)
        return query.order_by("title")
