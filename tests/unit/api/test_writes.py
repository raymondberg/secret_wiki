from fastapi.encoders import jsonable_encoder
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



def test_create_sections(client, db):
    response = client.post(f"/api/w/my_wiki/p/page_1/s", json={"content": "Some new content"})

    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Some new content"

    assert db.query(Section).filter_by(content="Some new content").first()


def test_patch_sections(client, db, sections):
    section = sections[0]

    section.content = section.content + "\n\nbut better"
    response = client.patch(f"/api/w/my_wiki/p/page_1/s/{section.id}", json=jsonable_encoder(section))
    assert response.status_code == 200

    data = response.json()
    assert data["content"] == section.content

    assert db.query(Section).filter_by(id=section.id).first().content == section.content


def test_patch_sections_can_just_do_section_index(client, db, sections):
    section = sections[0]

    section.content = section.content + "\n\nbut better"
    response = client.patch(f"/api/w/my_wiki/p/page_1/s/{section.id}", json={"section_index": 94321})
    assert response.status_code == 200

    data = response.json()
    assert data["section_index"] == 94321

    db.commit() # I think the time it takes the db to update might make this work, shrug
    assert db.query(Section).filter_by(id=section.id).first().section_index == 94321
