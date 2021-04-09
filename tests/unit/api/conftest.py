from fastapi.testclient import TestClient
import pytest

from secret_wiki.models import Wiki, Page, Section


@pytest.fixture
def client(test_app):
    return TestClient(test_app)


@pytest.fixture(scope="module")
def pages(db, wikis):
    wiki = wikis[0]
    p1 = Page(wiki_id=wiki.id, id="page_1", title="Page One")
    db.add(p1)

    p2 = Page(wiki_id=wiki.id, id="page_2", title="Page Two")
    db.add(p2)
    db.commit()

    return [p1, p2]


@pytest.fixture(scope="module")
def sections(db, pages):
    page = pages[0]
    section1 = Section(wiki_id=page.wiki_id, page_id=page.id, section_index=5, content="A later section")
    db.add(section1)

    section2 = Section(wiki_id=page.wiki_id, page_id=page.id, section_index=2, content="A section")
    db.add(section2)
    db.commit()

    return [section1, section2]


@pytest.fixture(scope="module")
def wikis(db):
    wiki1 = Wiki(id="my_wiki")
    db.add(wiki1)

    wiki2 = Wiki(id="your_wiki")
    db.add(wiki2)
    db.commit()

    return [wiki1, wiki2]
