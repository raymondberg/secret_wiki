from typing import Optional

from fastapi_users import models
from pydantic import EmailStr


class User(models.BaseUser, models.BaseOAuthAccountMixin):
    pass


class UserCreate(models.CreateUpdateDictModel):
    email: EmailStr
    password: str


class UserShellCreate(UserCreate):
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False
    is_verified: Optional[bool] = False


class UserUpdate(User, models.BaseUserUpdate):
    pass


class UserDB(User, models.BaseUserDB):
    pass
