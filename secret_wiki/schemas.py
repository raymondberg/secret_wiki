from typing import Optional

from pydantic import BaseModel


class Page(BaseModel):
    wiki_id: str
    id: str
    title: str

    class Config:
        orm_mode = True

class SectionCreate(BaseModel):
    content: str

    class Config:
        orm_mode = True

class Section(SectionCreate):
    id: int
    wiki_id: str
    page_id: str
    section_index: Optional[int] = None


class Wiki(BaseModel):
    id: str

    class Config:
        orm_mode = True
