from secret_wiki.db import get_db, get_or_create
from secret_wiki.models import Wiki, Page, Section

db = next(get_db())

lion_king,_ = get_or_create(db, Wiki, id="Lion King")
mulan,_ = get_or_create(db, Wiki, id="Mulan")

p_mulan,_ = get_or_create(db, Page, wiki_id=mulan.id, id="mulan", title="Mulan")
p_mushu,_ = get_or_create(db, Page, wiki_id=mulan.id, id="mushu", title="Mushu (Dragon)")

intro,_ = get_or_create(db, Section, wiki_id=mulan.id, page_id=p_mushu.id, content="He's a cute little dragon")
factoid,_ = get_or_create(db, Section, wiki_id=mulan.id, page_id=p_mushu.id, content="He's voiced by a famous person")

db.add(intro)
db.add(factoid)
db.commit()
