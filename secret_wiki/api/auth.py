import os

from fastapi import Request
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import CookieAuthentication

from ..schemas import User, UserCreate, UserUpdate, UserDB
from ..user_db import user_db


def on_after_register(user: UserDB, request: Request):
    print(f"User {user.id} has registered.")


def on_after_forgot_password(user: UserDB, token: str, request: Request):
    print(f"User {user.id} has forgot their password. Reset token: {token}")


def after_verification_request(user: UserDB, token: str, request: Request):
    print(f"Verification requested for user {user.id}. Verification token: {token}")


cookie_authentication = CookieAuthentication(secret=os.environ["SECRET"], lifetime_seconds=3600)

fastapi_users = FastAPIUsers(
    db=user_db,
    auth_backends=[cookie_authentication],
    user_model=User,
    user_create_model=UserCreate,
    user_update_model=UserUpdate,
    user_db_model=UserDB,
)

routers = [
    dict(
        router=fastapi_users.get_auth_router(cookie_authentication, "password"),
        prefix="/api/auth/cookie",
        tags=["auth"],
    ),
    dict(
        router=fastapi_users.get_register_router(on_after_register),
        prefix="/api/auth",
        tags=["auth"]
    ),
    # dict(
    #     router=fastapi_users.get_reset_password_router(
    #         os.getenv("SECRET"), after_forgot_password=on_after_forgot_password
    #     ),
    #     prefix="/api/auth",
    #     tags=["auth"],
    # ),
    # dict(
    #     router=fastapi_users.get_verify_router(
    #         os.getenv("SECRET"), after_verification_request=after_verification_request
    #     ),
    #     prefix="/api/auth",
    #     tags=["auth"],
    # ),
    dict(
        router=fastapi_users.get_users_router(),
        prefix="/api/users",
        tags=["users"]
    ),
]
