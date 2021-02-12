from fastapi.testclient import TestClient
import pytest

@pytest.fixture
def client(test_app):
    return TestClient(test_app)
