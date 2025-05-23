FROM node:21-alpine as statics_build

COPY ./frontend /var/app/frontend
WORKDIR /var/app/frontend

RUN npm install
RUN npm run build


FROM python:3.8
COPY --from=ghcr.io/astral-sh/uv:0.6.6 /uv /bin/uv
ENV UV_PYTHON_INSTALL_DIR=/opt/uv/python

WORKDIR /var/app

COPY pyproject.toml uv.lock /var/app/

RUN uv venv && uv sync --frozen --no-install-project

COPY . /var/app
COPY --from=statics_build /var/app/frontend/build/* /var/app/secret_wiki/static/

CMD uv run uvicorn secret_wiki.app:app --host 0.0.0.0 --port 8080 --reload --reload-dir secret_wiki --log-level trace
