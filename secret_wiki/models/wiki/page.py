import logging

from fastapi_users_db_sqlalchemy.guid import GUID
from sqlalchemy import Boolean, Column, ForeignKey, String, and_, or_, select

import secret_wiki.schemas.wiki as schemas
from secret_wiki.db import DB, Base

from .wiki import Wiki

logger = logging.getLogger(__file__)


class Page(Base):
    __tablename__ = "pages"

    id = Column(GUID, primary_key=True)
    wiki_id = Column(GUID, ForeignKey("wikis.id"))
    slug = Column(String, unique=True)
    title = Column(String)
    is_secret = Column(Boolean, default=False)

    @classmethod
    def all(cls):
        return select(cls)

    @classmethod
    def user_has_permission_to_page(cls, user):
        return or_(cls.is_secret == False, user.is_superuser)

    @classmethod
    async def get(cls, id):
        async with DB() as db:
            user = await db.execute(select(cls).where(cls.id == id))
            return user.scalars().first()

    def update(self, section_update):
        for attr in ("title", "slug", "is_secret"):
            if (value := getattr(section_update, attr)) is not None:
                setattr(self, attr, value)

    @classmethod
    async def fanout(self):
        from .section import Section

        sections = await Section.for_page(page=self)
        total_sections = len(sections)
        starting_index, max_index = 1000, 1000000
        distance = max_index - starting_index
        gap_size = distance // total_sections

        before_sections = []
        after_sections = []

        async with DB() as db:
            async with db.begin_nested():
                for section in sections:
                    before_sections.append(section.section_index)
                    section.section_index = starting_index
                    after_sections.append(section.section_index)
                    db.add(section)
                    starting_index += gap_size
        logger.info("Before fanout indexes were %s", before_sections)
        logger.info("After fanout indexes were %s", after_sections)
        return sections

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
            query = query.where(Page.is_secret == False)  # pylint: disable=singleton-comparison
        if page_id:
            query = query.where(Page.id == page_id)
        if page_slug:
            query = query.where(Page.slug == page_slug)
        return query.order_by("title")


def convert_search_result(slug, title, content, q):
    width = 40
    excerpt = title
    if content:
        try:
            first_location = content.lower().index(q)
            excerpt = content[
                max(first_location - width // 2, 0) : max(first_location + width // 2, width)
            ]
        except ValueError:
            excerpt = content[:width]

    return schemas.SearchResult(page_slug=slug, excerpt=excerpt)


def dedupe(list_of_search_results):
    """Quick and dirty, should replace with distinct or group-by in query"""
    page_slugs = set()
    for result in list_of_search_results:
        if result.page_slug in page_slugs:
            continue
        page_slugs.add(result.page_slug)
        yield result


async def get_search_results(wiki_id: str, search_string: str, user):
    from .section import Section

    query = (
        select(Page.slug, Page.title, Section.content)
        .join(Section)
        .outerjoin(Section.section_permissions)
        .where(
            and_(
                Page.wiki_id == wiki_id,
                Page.user_has_permission_to_page(user),
                Section.user_has_permission_to_section(user),
                or_(
                    Section.content.ilike(f"%{search_string}%"),
                    Page.slug.ilike(f"%{search_string}%"),
                    Page.title.ilike(f"%{search_string}%"),
                ),
            )
        )
        .limit(10)
    )
    async with DB() as db:
        user = await db.execute(query)
        return dedupe([convert_search_result(*row, search_string) for row in user.all()])
