import enum
import re
from typing import List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator

# pylint: disable=too-few-public-methods


def to_identifier(varStr):
    return re.sub(r"\W|^(?=\d)", "-", varStr).lower()


class PermissionLevel(enum.Enum):
    EDIT = "edit"
    NONE = "none"


class PageCreate(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: str
    slug: str = None  # type: ignore
    is_admin_only: Optional[bool] = False

    @validator("slug", pre=True, always=True)
    def set_slug(cls, value, *, values):  # pylint: disable=no-self-argument,no-self-use
        return value or to_identifier(values["title"])


class Page(BaseModel):
    wiki_id: UUID
    id: UUID
    slug: str
    title: str
    is_admin_only: bool

    class Config:
        orm_mode = True


class SectionPermission(BaseModel):
    user: str
    level: PermissionLevel

    class Config:
        orm_mode = True


class SectionCreate(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    content: str
    section_index: Optional[int] = None
    is_admin_only: Optional[bool] = False
    permissions: Optional[List[SectionPermission]] = None

    class Config:
        orm_mode = True


class SectionUpdate(BaseModel):
    content: Optional[str] = None
    section_index: Optional[int] = None
    is_admin_only: Optional[bool] = None
    permissions: Optional[List[SectionPermission]] = None


class Section(SectionCreate):
    id: UUID
    page_id: UUID
    section_index: Optional[int] = None
    is_admin_only: bool = False
    permissions: Optional[List[SectionPermission]] = None
    is_secret: bool = False


class Wiki(BaseModel):
    id: UUID
    slug: str

    class Config:
        orm_mode = True
