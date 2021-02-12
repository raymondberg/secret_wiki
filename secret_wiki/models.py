from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    Sequence,
    String,
    Text
)

from sqlalchemy.orm import relationship

from .db import Base

class Wiki(Base):
    __tablename__ = "wikis"

    id = Column(String, primary_key=True)


class Page(Base):
    __tablename__ = "pages"

    id = Column(String, primary_key=True)
    wiki_id = Column(String, ForeignKey("wikis.id"), primary_key=True)
    title = Column(String)


class Section(Base):
    __tablename__ = "sections"
    __table_args__ = (
        ForeignKeyConstraint(
            ['wiki_id', 'page_id'],
            ['pages.wiki_id', 'pages.id']
            ),
    )

    id = Column(Integer, primary_key=True)
    wiki_id = Column(String, ForeignKey("wikis.id"))
    section_index = Column(Integer, default=5000)
    content = Column(Text)

    page_id = Column(String, ForeignKey("pages.id"))
