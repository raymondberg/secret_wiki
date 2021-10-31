from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates

from .api.wiki import router as wiki_router
from .api.auth import routers as auth_routers

project_root = Path(__file__).parent
templates = Jinja2Templates(directory=project_root / "templates")


async def homepage(request):
    return templates.TemplateResponse("index.html", {"request": request})


async def login(request):
    return templates.TemplateResponse("login.html", {"request": request})


routes = [
    Route("/", homepage),
    Route("/login", login),
    Mount("/static", StaticFiles(directory=project_root / "static"), name="static"),
]

app = FastAPI(routes=routes)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wiki_router)
for router_config in auth_routers:
    app.include_router(**router_config)
