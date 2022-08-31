import pytest

from secret_wiki.schemas.wiki import PageCreate


@pytest.mark.parametrize(
    "in_value, out_value",
    [
        ("hi there", "hi-there"),
        ("with (parens)", "with-parens"),
        ("lots    of space", "lots-of-space"),
        ("special!@#$%^&*() chars", "special-chars"),
    ],
)
def test_page_create_slug_has_lazy_default(in_value, out_value):
    assert PageCreate(title=in_value).slug == out_value
