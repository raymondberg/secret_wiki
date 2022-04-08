from secret_wiki.schemas.wiki import PageCreate


def test_page_create_slug_has_lazy_default():
    page = PageCreate(title="hi there")
    assert page.slug == "hi-there"
