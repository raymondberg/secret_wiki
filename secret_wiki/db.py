import os
from typing import AsyncGenerator

from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from sqlalchemy import create_engine, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker  # pylint: disable=unused-import
from sqlalchemy.sql.expression import ClauseElement

from .schemas.auth import UserDB

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./database.db")

engine = create_async_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})


class AsyncDatabaseSession:
    def __init__(self):
        self._session = None
        self._engine = None

    def __getattr__(self, name):
        return getattr(self.session, name)

    @property
    def session(self):
        return self._session

    async def init(self):
        self._engine = create_async_engine(
            SQLALCHEMY_DATABASE_URL,
            echo=True,
        )

        self._session = sessionmaker(
            self._engine,
            autocommit=False,
            autoflush=False,
            class_=AsyncSession,
            expire_on_commit=False,
        )()

    async def create_all(self):
        async with self._engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)


async_session_maker = AsyncDatabaseSession

Base = declarative_base()


class User(Base, SQLAlchemyBaseUserTable):  # pylint: disable=too-few-public-methods
    @classmethod
    async def all(cls):
        session = AsyncDatabaseSession()
        await session.init()
        result = await session.execute(select(cls))
        return result.scalars().all()

    @classmethod
    async def find_by_id(cls, id):
        session = AsyncDatabaseSession()
        result = await session.execute(select(cls).where(cls.id == id))
        return result.scalars().first()


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    session = async_session_maker()
    await session.init()
    yield session
    session.close()


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(UserDB, session, User)
