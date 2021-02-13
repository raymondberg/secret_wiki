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
    section_index: Optional[int] = None

    class Config:
        orm_mode = True

class SectionUpdate(BaseModel):
    content: Optional[str] = None
    section_index: Optional[int] = None

class Section(SectionCreate):
    id: int
    wiki_id: str
    page_id: str
    section_index: Optional[int] = None


class Wiki(BaseModel):
    id: str

    class Config:
        orm_mode = True
