from fastapi.testclient import TestClient
import pytest

from secret_wiki.models import Wiki, Page, Section
from secret_wiki.api.wiki import current_active_user
from secret_wiki.schemas import User


@pytest.fixture
def admin_client(test_app, override_current_active_user):
    test_app.dependency_overrides[current_active_user] = override_current_active_user(
        is_admin=True
    )
    return TestClient(test_app)


@pytest.fixture
def client(test_app, override_current_active_user):
    test_app.dependency_overrides[current_active_user] = override_current_active_user()
    return TestClient(test_app)


@pytest.fixture
def override_current_active_user():
    def override_current_active_user_(is_admin=False):
        return lambda: User(email="test-user@example.com", is_superuser=is_admin)

    return override_current_active_user_


@pytest.fixture
def pages(db, wikis):
    wiki = wikis[0]
    p1 = Page(wiki_id=wiki.id, id="page_1", title="Page One")
    db.add(p1)

    p2 = Page(wiki_id=wiki.id, id="page_2", title="Page Two")
    db.add(p2)
    db.commit()

    return [p1, p2]


@pytest.fixture
def admin_only_page(db, wikis):
    wiki = wikis[0]
    p1 = Page(
        wiki_id=wiki.id,
        id="admin_only_page",
        title="Admin Only Page",
        is_admin_only=True,
    )
    db.add(p1)
    db.commit()
    return p1


@pytest.fixture
def sections(db, pages):
    page = pages[0]
    section1 = Section(
        wiki_id=page.wiki_id,
        page_id=page.id,
        section_index=5,
        content="A later section",
    )
    db.add(section1)

    section2 = Section(
        wiki_id=page.wiki_id, page_id=page.id, section_index=2, content="A section"
    )
    db.add(section2)
    db.commit()

    return [section1, section2]


@pytest.fixture
def admin_only_section(db, pages):
    page = pages[0]
    admin_section = Section(
        wiki_id=page.wiki_id,
        page_id=page.id,
        is_admin_only=True,
        section_index=5,
        content="Admin only section",
    )
    db.add(admin_section)
    db.commit()

    return admin_section


@pytest.fixture
def wikis(db):
    wiki1 = Wiki(id="my_wiki")
    db.add(wiki1)

    wiki2 = Wiki(id="your_wiki")
    db.add(wiki2)
    db.commit()

    return [wiki1, wiki2]
