from fastapi_users_db_sqlalchemy.guid import GUID
from sqlalchemy import Column, String, select

from secret_wiki.db import Base


class Wiki(Base):
    __tablename__ = "wikis"

    id = Column(GUID, primary_key=True)
    slug = Column(String, unique=True)
    name = Column(String, nullable=True, default=None)

    def __str__(self):
        return f"Wiki(id={id})"

    @classmethod
    def all(cls):
        return select(cls)
