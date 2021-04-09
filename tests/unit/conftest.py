from pathlib import Path
from unittest.mock import patch
import os
import re

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest

from secret_wiki.api.wiki import current_active_user
from secret_wiki.db import Base, get_db
from secret_wiki.schemas import User
import secret_wiki.models as models

TEST_DB_URL = "sqlite:///./test.db"


@pytest.fixture
def engine():
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    return engine


@pytest.fixture
def db(engine):
    Session = sessionmaker(autocommit=False, autoflush=True, bind=engine)
    db = Session()
    for model in [models.Section, models.Page, models.Wiki]:
        db.query(model).delete()
    yield db
    db.close()


@pytest.fixture
def test_app(override_get_db):
    # with patch.dict('secret_wiki.db.os.environ', {"DATABASE_URL": "sqlite:///./database-test.db"}):
    from secret_wiki.app import app

    app.dependency_overrides[get_db] = override_get_db
    yield app


@pytest.fixture
def override_get_db(db):
    def override_get_db_():
        yield db

    return override_get_db_
