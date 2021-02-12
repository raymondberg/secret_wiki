starting_locals = set(locals())

from secret_wiki.db import get_db
from secret_wiki.models import Wiki, Page, Section

db = next(get_db())

print(f"Preloaded: {', '.join(sorted(set(locals()) - starting_locals))}")
