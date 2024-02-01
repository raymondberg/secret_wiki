FROM node:21-alpine as statics_build

COPY . /var/app
WORKDIR /var/app/frontend

RUN npm install && npm run build


FROM python:3.8

WORKDIR /var/app

COPY Pipfile Pipfile.lock /var/app/

RUN pip install pipenv && pipenv install --system --deploy

COPY . /var/app
COPY --from=statics_build /var/app/frontend/build/* /var/app/secret_wiki/static/

CMD pipenv run uvicorn secret_wiki.app:app --host 0.0.0.0 --port 8080 --reload --reload-dir secret_wiki --log-level trace
