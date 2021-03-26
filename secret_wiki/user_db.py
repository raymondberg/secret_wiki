from fastapi_users.db import SQLAlchemyUserDatabase

from .db import database
from .models import OAuthAccount, User
from .schemas import UserDB

user_db = SQLAlchemyUserDatabase(UserDB, database, User.__table__, OAuthAccount.__table__)
