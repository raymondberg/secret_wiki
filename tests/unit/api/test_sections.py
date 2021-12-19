from fastapi.encoders import jsonable_encoder

from secret_wiki.models import Section


def test_list_sections(client, sections):
    response = client.get("/api/w/my_wiki/p/page_1/s")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == len(sections)
    assert {d["content"] for d in data} == {s.content for s in sections}


def test_list_cannot_list_admin_only_sections(client, admin_only_section):
    response = client.get("/api/w/my_wiki/p/page_1/s")
    assert response.status_code == 200

    data = response.json()
    assert admin_only_section.id not in {s["id"] for s in data}


def test_create_sections(client, db):
    response = client.post(
        "/api/w/my_wiki/p/page_1/s",
        json={"content": "Some new content", "is_admin_only": True},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Some new content"
    assert data["is_admin_only"]

    assert db.query(Section).filter_by(content="Some new content", is_admin_only=True).first()


def test_post_sections(client, db, sections):
    section = sections[0]

    section.content = section.content + "\n\nbut better"
    response = client.post(
        f"/api/w/my_wiki/p/page_1/s/{section.id}", json=jsonable_encoder(section)
    )
    assert response.status_code == 200

    data = response.json()
    assert data["content"] == section.content

    assert db.query(Section).filter_by(id=section.id).first().content == section.content


def test_cannot_post_admin_sections(client, admin_only_section):
    response = client.post(
        f"/api/w/my_wiki/p/page_1/s/{admin_only_section.id}",
        json=jsonable_encoder(admin_only_section),
    )
    assert response.status_code == 404


def test_admin_can_post_admin_sections(admin_client, db, admin_only_section):
    response = admin_client.post(
        f"/api/w/my_wiki/p/page_1/s/{admin_only_section.id}",
        json={"is_admin_only": False},
    )
    assert response.status_code == 200
    assert not db.query(Section).filter_by(id=admin_only_section.id).first().is_admin_only


def test_post_sections_can_just_do_section_index(client, db, sections):
    section = sections[0]

    section.content = section.content + "\n\nbut better"
    response = client.post(
        f"/api/w/my_wiki/p/page_1/s/{section.id}", json={"section_index": 94321}
    )
    assert response.status_code == 200

    data = response.json()
    assert data["section_index"] == 94321

    db.commit()  # I think the time it takes the db to update might make this work, shrug
    assert db.query(Section).filter_by(id=section.id).first().section_index == 94321
