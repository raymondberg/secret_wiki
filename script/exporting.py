import json

from fastapi.encoders import jsonable_encoder
import asyncio

from secret_wiki.db import get_db
from secret_wiki.models import Wiki, Page, Section
from secret_wiki.schemas import UserShellCreate

db = next(get_db())


wikis = db.query(Wiki)

for export_class, export_name in ((Wiki, "wiki"), (Page, "page"), (Section, "section")):
    with open(f"sw_export_{export_name}.json", "w") as json_handle:
        json.dump(jsonable_encoder(wikis), json_handle)
