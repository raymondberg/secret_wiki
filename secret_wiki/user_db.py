from fastapi_users.db import SQLAlchemyUserDatabase

from .db import engine
from .models import OAuthAccount, User
from .schemas import UserDB

user_db = SQLAlchemyUserDatabase(UserDB, engine, User.__table__, OAuthAccount.__table__)
