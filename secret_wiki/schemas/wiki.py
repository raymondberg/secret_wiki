import enum
import re
from typing import List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator

# pylint: disable=too-few-public-methods


def to_identifier(var_string):
    return re.sub(r"\W+|^(?=\d)+", "-", var_string).strip("-").lower()


class PermissionLevel(enum.Enum):
    EDIT = "edit"
    NONE = "none"


class PageUpdate(BaseModel):
    title: str
    slug: str = None  # type: ignore
    parent_page_id: Optional[UUID]
    is_secret: Optional[bool] = False

    @validator("slug", pre=True, always=True)
    def set_slug(cls, value, *, values):  # pylint: disable=no-self-argument,no-self-use
        return value or to_identifier(values["title"])


class PageCreate(PageUpdate):
    id: UUID = Field(default_factory=uuid4)


class Page(BaseModel):
    wiki_id: UUID
    id: UUID
    slug: str
    title: str
    is_secret: bool
    parent_page_id: Optional[UUID]

    class Config:
        orm_mode = True


class SearchResult(BaseModel):
    page_slug: str
    excerpt: str


class SectionPermission(BaseModel):
    user: str
    level: PermissionLevel

    class Config:
        orm_mode = True


class SectionCreate(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    content: str
    section_index: Optional[int] = None
    is_secret: Optional[bool] = False
    permissions: Optional[List[SectionPermission]] = None

    class Config:
        orm_mode = True


class SectionUpdate(BaseModel):
    content: Optional[str] = None
    section_index: Optional[int] = None
    is_secret: Optional[bool] = None
    permissions: Optional[List[SectionPermission]] = None


class Section(SectionCreate):
    id: UUID
    page_id: UUID
    section_index: Optional[int] = None
    is_secret: bool = False
    permissions: Optional[List[SectionPermission]] = None


class Wiki(BaseModel):
    id: UUID
    name: str
    slug: str

    class Config:
        orm_mode = True
