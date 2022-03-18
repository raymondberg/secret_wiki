import enum
from typing import List, Optional

from pydantic import BaseModel

# pylint: disable=too-few-public-methods


class PermissionLevel(enum.Enum):
    EDIT = "edit"
    NONE = "none"


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


class SectionPermission(BaseModel):
    user: str
    level: PermissionLevel


class SectionCreate(BaseModel):
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
    id: int
    wiki_id: str
    page_id: str
    section_index: Optional[int] = None
    is_admin_only: bool = False
    permissions: Optional[List[SectionPermission]] = None


class Wiki(BaseModel):
    id: str

    class Config:
        orm_mode = True
