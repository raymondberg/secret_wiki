from typing import Optional

from pydantic import BaseModel


class PageCreate(BaseModel):
    id: str
    title: str
    is_admin_only: Optional[bool] = False


class Page(BaseModel):
    wiki_id: str
    id: str
    title: str
    is_admin_only: bool

    class Config:
        orm_mode = True


class SectionCreate(BaseModel):
    content: str
    section_index: Optional[int] = None
    is_admin_only: bool = False

    class Config:
        orm_mode = True


class SectionUpdate(BaseModel):
    content: Optional[str] = None
    section_index: Optional[int] = None
    is_admin_only: Optional[bool] = None


class Section(SectionCreate):
    id: int
    wiki_id: str
    page_id: str
    section_index: Optional[int] = None
    is_admin_only: bool = False


class Wiki(BaseModel):
    id: str

    class Config:
        orm_mode = True
