from pydantic import BaseModel


class Page(BaseModel):
    wiki_id: str
    id: str
    title: str

    class Config:
        orm_mode = True

class Section(BaseModel):
    id: int
    wiki_id: str
    page_id: str
    section_index: int
    content: str

    class Config:
        orm_mode = True


class Wiki(BaseModel):
    id: str

    class Config:
        orm_mode = True
