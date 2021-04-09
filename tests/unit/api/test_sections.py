from fastapi.encoders import jsonable_encoder

from secret_wiki.models import Wiki, Page, Section


def test_list_sections(client, db, sections):
    response = client.get("/api/w/my_wiki/p/page_1/s")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 2
    assert data[0]["content"] == "A section"
    assert data[1]["content"] == "A later section"


def test_create_sections(client, db):
    response = client.post(
        f"/api/w/my_wiki/p/page_1/s", json={"content": "Some new content"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Some new content"

    assert db.query(Section).filter_by(content="Some new content").first()


def test_patch_sections(client, db, sections):
    section = sections[0]

    section.content = section.content + "\n\nbut better"
    response = client.patch(
        f"/api/w/my_wiki/p/page_1/s/{section.id}", json=jsonable_encoder(section)
    )
    assert response.status_code == 200

    data = response.json()
    assert data["content"] == section.content

    assert db.query(Section).filter_by(id=section.id).first().content == section.content


def test_patch_sections_can_just_do_section_index(client, db, sections):
    section = sections[0]

    section.content = section.content + "\n\nbut better"
    response = client.patch(
        f"/api/w/my_wiki/p/page_1/s/{section.id}", json={"section_index": 94321}
    )
    assert response.status_code == 200

    data = response.json()
    assert data["section_index"] == 94321

    db.commit()  # I think the time it takes the db to update might make this work, shrug
    assert db.query(Section).filter_by(id=section.id).first().section_index == 94321
