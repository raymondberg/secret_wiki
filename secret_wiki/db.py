import os

import databases
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker  # pylint: disable=unused-import
from sqlalchemy.sql.expression import ClauseElement

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./database.db")

database = databases.Database(SQLALCHEMY_DATABASE_URL)

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
