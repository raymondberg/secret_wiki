from fastapi_users import models
from pydantic import EmailStr


class User(models.BaseUser, models.BaseOAuthAccountMixin):
    pass


class UserCreate(models.CreateUpdateDictModel):
    email: EmailStr
    password: str


class UserUpdate(User, models.BaseUserUpdate):
    pass


class UserDB(User, models.BaseUserDB):
    pass
