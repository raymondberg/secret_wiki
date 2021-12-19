from fastapi_users.db import SQLAlchemyBaseOAuthAccountTable, SQLAlchemyBaseUserTable

from ..db import Base

# pylint: disable=too-few-public-methods


class User(Base, SQLAlchemyBaseUserTable):
    pass


class OAuthAccount(SQLAlchemyBaseOAuthAccountTable, Base):
    pass
