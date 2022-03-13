import os
from typing import AsyncGenerator

from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker  # pylint: disable=unused-import
from sqlalchemy.sql.expression import ClauseElement

from .schemas.auth import UserDB

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./database.db")

engine = create_async_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
async_session_maker = sessionmaker(
    engine, autocommit=False, autoflush=False, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()


class User(Base, SQLAlchemyBaseUserTable):  # pylint: disable=too-few-public-methods
    pass


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(UserDB, session, User)


def get_or_create(session, model, defaults=None, **kwargs):
    instance = session.query(model).filter_by(**kwargs).one_or_none()
    if instance:
        return instance, False

    params = {k: v for k, v in kwargs.items() if not isinstance(v, ClauseElement)}
    params.update(defaults or {})
    instance = model(**params)
    try:
        # session.add(instance)
        session.commit()
    # The actual exception depends on the specific database so we catch all
    # exceptions. This is similar to the official documentation:
    # https://docs.sqlalchemy.org/en/latest/orm/session_transaction.html
    except Exception:  # pylint: disable=broad-except
        session.rollback()
        instance = session.query(model).filter_by(**kwargs).one()
        return instance, False
    else:
        return instance, True
