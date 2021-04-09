def test_list_wikis(client, db, wikis):
    response = client.get("/api/w")
    assert response.status_code == 200
    data = response.json()
    assert data == [
        {"id": "my_wiki"},
        {"id": "your_wiki"},
    ]
