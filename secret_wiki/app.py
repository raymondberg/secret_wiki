from pathlib import Path

from fastapi import FastAPI
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates

from .api import router as api_router

project_root = Path(__file__).parent
templates = Jinja2Templates(directory=project_root / 'templates')

async def homepage(request):
    return templates.TemplateResponse('index.html', {'request': request})

routes = [
    Route('/', homepage),
    Mount('/static', StaticFiles(directory=project_root / 'static'), name='static')
]

app = FastAPI(routes=routes)
app.include_router(api_router)

