from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.routing import Mount
from starlette.staticfiles import StaticFiles

from .api.auth import routers as auth_routers
from .api.user import router as user_router
from .api.wiki import router as wiki_router

project_root = Path(__file__).parent

app = FastAPI()

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
app.include_router(user_router)
for router_config in auth_routers:
    app.include_router(**router_config)

app.router.routes.append(
    Mount(
        "/",
        app=StaticFiles(directory=project_root / "static", html=True),
        name="static",
    ),
)
