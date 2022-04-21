import os

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi_users import BaseUserManager, FastAPIUsers
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase

from secret_wiki.db import get_user_db

from ..schemas import User, UserCreate, UserDB, UserUpdate


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


class UserManager(BaseUserManager[UserCreate, UserDB]):
    user_db_model = UserDB

    async def on_after_register(self, user: UserDB, request: Request):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(self, user: UserDB, token: str, request: Request):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def after_verification_request(self, user: UserDB, token: str, request: Request):
        print(f"Verification requested for user {user.id}. Verification token: {token}")


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=os.environ["SECRET"], lifetime_seconds=int(os.environ.get("JWT_REFRESH_TIME", 3600))
    )


jwt_authentication = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)


fastapi_users = FastAPIUsers(
    get_user_manager,
    auth_backends=[jwt_authentication],
    user_model=User,
    user_create_model=UserCreate,
    user_update_model=UserUpdate,
    user_db_model=UserDB,
)

routers = [
    dict(
        router=fastapi_users.get_auth_router(jwt_authentication, "password"),
        prefix="/api/auth/jwt",
        tags=["auth"],
    ),
    dict(
        router=fastapi_users.get_register_router(),
        prefix="/api/auth",
        tags=["auth"],
    ),
    dict(router=fastapi_users.get_users_router(), prefix="/api/users", tags=["users"]),
]
