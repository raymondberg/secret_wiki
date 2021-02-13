from pathlib import Path
from unittest.mock import patch
import os
import re

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest

from secret_wiki.db import Base, get_db
from secret_wiki.models import *


TEST_DB_URL = "sqlite:///./test.db"


@pytest.fixture(scope="module", autouse=True)
def cleared_db(db):
    db_path = Path(re.sub(r".*:///", "", TEST_DB_URL))
    if db_path.exists():
        db_path.unlink()
    Base.metadata.create_all(bind=create_engine(TEST_DB_URL))


@pytest.fixture(scope="session")
def db(testing_session_local):
    return testing_session_local()


@pytest.fixture(scope="session")
def test_app(override_get_db):
    # with patch.dict('secret_wiki.db.os.environ', {"DATABASE_URL": "sqlite:///./database-test.db"}):
    from secret_wiki.app import app
    app.dependency_overrides[get_db] = override_get_db
    yield app


@pytest.fixture(scope="session")
def testing_session_local():
    engine = create_engine(
        TEST_DB_URL, connect_args={"check_same_thread": False}
    )
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def override_get_db(testing_session_local):
    def override_get_db_():
        try:
            db = testing_session_local()
            yield db
        finally:
            db.close()
    return override_get_db_
