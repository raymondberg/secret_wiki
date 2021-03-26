import asyncio

from fastapi_users.user import UserNotExists

from secret_wiki.api.auth import fastapi_users
from secret_wiki.db import get_db, get_or_create
from secret_wiki.models import Wiki, Page, Section
from secret_wiki.schemas import UserCreate

db = next(get_db())

async def create_user():
    try:
        user = await fastapi_users.get_user("admin@example.com")
    except UserNotExists:
        user = await fastapi_users.create_user(
            UserCreate(
                email="admin@example.com",
                password="admin",
                is_superuser=True,
                is_verified=True,
            )
        )
    return user
user = asyncio.run(create_user())

lion_king,_ = get_or_create(db, Wiki, id="Lion King")
mulan,_ = get_or_create(db, Wiki, id="Mulan")

p_mulan,_ = get_or_create(db, Page, wiki_id=mulan.id, id="mulan", title="Mulan")
p_mushu,_ = get_or_create(db, Page, wiki_id=mulan.id, id="mushu", title="Mushu (Dragon)")

intro,_ = get_or_create(db, Section, wiki_id=mulan.id, page_id=p_mushu.id, content="""## ABOUT
He's a cute little dragon""")

factoid,_ = get_or_create(db, Section, wiki_id=mulan.id, page_id=p_mushu.id, content="""## Facts

 * Voiced by a famous person
 * Red...I think
 * Has 4 legs
 * Very cowardly, but improves over the film
""")

for entry in (lion_king, mulan, p_mulan, p_mushu, intro, factoid):
    db.add(entry)
db.commit()
