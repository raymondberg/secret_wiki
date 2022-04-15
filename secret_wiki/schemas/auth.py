from typing import Optional

from fastapi_users import models
from pydantic import UUID4, EmailStr


class PublicUser(models.BaseModel, orm_mode=True):
    id: UUID4
    email: EmailStr


class User(models.BaseUser, models.BaseOAuthAccountMixin, orm_mode=True):
    def can_update_section(self, section):
        return self.is_superuser or not section.is_secret


class UserCreate(models.CreateUpdateDictModel):
    email: EmailStr
    password: str


class UserShellCreate(UserCreate):
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False
    is_verified: Optional[bool] = False


class UserUpdate(models.BaseUserUpdate):
    pass


class UserDB(User, models.BaseUserDB):
    pass
