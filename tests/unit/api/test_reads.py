import pytest

from secret_wiki.models import Wiki, Page, Section


@pytest.fixture(scope="module", autouse=True)
def wikis(db):
    wiki1 = Wiki(id="my_wiki")
    db.add(wiki1)

    wiki2 = Wiki(id="your_wiki")
    db.add(wiki2)
    db.commit()

    return [wiki1, wiki2]


@pytest.fixture(scope="module", autouse=True)
def pages(db, wikis):
    wiki = wikis[0]
    p1 = Page(wiki_id=wiki.id, id="page_1", title="Page One")
    db.add(p1)

    p2 = Page(wiki_id=wiki.id, id="page_2", title="Page Two")
    db.add(p2)
    db.commit()

    return [p1, p2]

@pytest.fixture(scope="module", autouse=True)
def sections(db, pages):
    page = pages[0]
    section1 = Section(wiki_id=page.wiki_id, page_id=page.id, section_index=5, content="A later section")
    db.add(section1)

    section2 = Section(wiki_id=page.wiki_id, page_id=page.id, section_index=2, content="A section")
    db.add(section2)
    db.commit()

    return [section1, section2]


def test_list_wikis(client, db):
    response = client.get("/api/w")
    assert response.status_code == 200
    data = response.json()
    assert data == [
        {"id": "my_wiki"},
        {"id": "your_wiki"},
    ]

def test_list_all_pages(client, db):
    response = client.get("/api/w/my_wiki/p")
    assert response.status_code == 200
    data = response.json()
    assert data == [
        {"id": "page_1", "title": "Page One", "wiki_id": "my_wiki"},
        {"id": "page_2", "title": "Page Two", "wiki_id": "my_wiki"},
    ]


def test_read_page(client, db):
    response = client.get("/api/w/my_wiki/p/page_1")
    assert response.status_code == 200
    data = response.json()
    assert data == {"id": "page_1", "title": "Page One", "wiki_id": "my_wiki"}


def test_list_sections(client, db):
    response = client.get("/api/w/my_wiki/p/page_1/s")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 2
    assert data[0]["content"] == "A section"
    assert data[1]["content"] == "A later section"
