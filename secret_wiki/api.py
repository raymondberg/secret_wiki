from typing import List

from fastapi import APIRouter

from .models import Page, Section, Wiki

router = APIRouter(prefix="/api")

@router.get("/w", response_model=List[Wiki])
def root():
    return [Wiki(id=1, name="NCGG"), Wiki(id=2, name="GoS")]

@router.get("/w/{wiki_id}/p", response_model=List[Page])
def wiki(wiki_id: str):
    pages = {
        "1": [Page(id=1, wiki_id=wiki_id, title="Ray's Page")],
        "2": [Page(id=2, wiki_id=wiki_id, title="Eric's Page")],
    }
    return pages.get(wiki_id, [])

@router.get("/w/{wiki_id}/p/{page_id}", response_model=Page)
def wiki_page(wiki_id: str, page_id: str):
    return Page(id=page_id, wiki_id=wiki_id, title="some title")

@router.get("/w/{wiki_id}/p/{page_id}/s", response_model=List[Section])
def wiki_page(wiki_id:str, page_id: str):
    return [
        Section(id=idx, wiki_id=wiki_id, page_id=page_id, section_index=0, content="# Test\n\nThis is some test content\n\nThis will repeat\n\n    some code")
        for idx in range(20)
    ]
