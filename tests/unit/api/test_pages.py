from secret_wiki.models import Wiki, Page, Section

def test_list_all_pages(client, db, pages):
    response = client.get("/api/w/my_wiki/p")
    assert response.status_code == 200
    data = response.json()

    assert data == [
        {"id": "page_1", "title": "Page One", "wiki_id": "my_wiki", "is_admin_only": False},
        {"id": "page_2", "title": "Page Two", "wiki_id": "my_wiki", "is_admin_only": False},
    ]


def test_read_page(client, db, pages):
    response = client.get("/api/w/my_wiki/p/page_1")
    assert response.status_code == 200
    data = response.json()
    assert data == {"id": "page_1", "title": "Page One", "wiki_id": "my_wiki", "is_admin_only": False}


def test_create_page(client, db):
    response = client.post(f"/api/w/my_wiki/p", json={"id": "my_page", "title": "my page", "is_admin_only": True})

    assert response.status_code == 200
    data = response.json()

    assert data["id"] == "my_page"
    assert data["title"] == "my page"
    assert data["is_admin_only"] == True

    assert db.query(Page).filter_by(id="my_page").first().title == "my page"

