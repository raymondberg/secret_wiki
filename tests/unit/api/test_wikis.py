def test_list_wikis(client, wikis):
    response = client.get("/api/w")
    assert response.status_code == 200
    data = response.json()
    assert {d["id"] for d in data} == {w.id for w in wikis}
