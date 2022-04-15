import asyncio
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import Depends
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from sqlalchemy import create_engine, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker  # pylint: disable=unused-import
from sqlalchemy.sql.expression import ClauseElement

from .schemas.auth import UserDB

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./database.db")

engine = create_async_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

async_session = sessionmaker(
    engine,
    autocommit=False,
    autoflush=False,
    class_=AsyncSession,
    expire_on_commit=False,
)


Base = declarative_base()


class User(Base, SQLAlchemyBaseUserTable):  # pylint: disable=too-few-public-methods
    @classmethod
    async def all(cls):
        async with DB() as db:
            result = await db.execute(select(cls))
            return result.scalars().all()

    @classmethod
    async def find_by_id(cls, id):
        async with DB() as db:
            result = await db.execute(select(cls).where(cls.id == id))
            return result.scalars().first()


@asynccontextmanager
async def DB():
    async with async_session() as session:
        yield session


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with DB() as db:
        yield db


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(UserDB, session, User)
