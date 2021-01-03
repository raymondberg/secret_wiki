from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()


class Page(BaseModel):
    wiki_id: str
    page_id: str
    title: str

class Section(BaseModel):
    wiki_id: str
    page_id: str
    section_index: int
    content: str

@app.get("/")
def root():
        return {"Hello": "World"}

@app.get("/w/{wiki_id}")
def wiki(wiki_id: str):
    return {"wiki_id": wiki_id}

@app.get("/w/{wiki_id}/p/{page_id}", response_model=Page)
def wiki_page(wiki_id: str, page_id: str):
    return Page(wiki_id=wiki_id, page_id=page_id, title="some title")

@app.get("/w/{wiki_id}/p/{page_id}/sections/", response_model=List[Section])
def wiki_page(wiki_id:str, page_id: str):
    return [Section(wiki_id=wiki_id, page_id=page_id, section_index=0, content="some content")]
