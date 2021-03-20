from typing import List

from fastapi import APIRouter, Depends

from .. import db, models, schemas
from .auth import fastapi_users

router = APIRouter(prefix="/api")

@router.get("/greeting")
def protected_route(user: models.User = Depends(fastapi_users.current_user())):
        return f"Hello, {user.email}"


@router.get("/w", response_model=List[schemas.Wiki])
def root(db: db.Session = Depends(db.get_db)):
    return db.query(models.Wiki).all()


@router.get("/w/{wiki_id}/p", response_model=List[schemas.Page])
def wiki(wiki_id: str, db: db.Session = Depends(db.get_db)):
    return db.query(models.Page).filter_by(wiki_id=wiki_id).order_by("title").all()


@router.post("/w/{wiki_id}/p", response_model=schemas.Page)
def wiki(wiki_id: str, page_create: schemas.PageCreate, db: db.Session = Depends(db.get_db)):
    with db.begin_nested():
        page = models.Page(
            wiki_id=wiki_id,
            id=page_create.id,
            title=page_create.title,
            )
        db.add(page)
    return page


@router.get("/w/{wiki_id}/p/{page_id}", response_model=schemas.Page)
def wiki_page(wiki_id: str, page_id: str, db: db.Session = Depends(db.get_db)):
    return db.query(models.Page).filter_by(wiki_id=wiki_id, id=page_id).first()


@router.get("/w/{wiki_id}/p/{page_id}/s", response_model=List[schemas.Section])
def wiki_sections(wiki_id:str, page_id: str, db: db.Session = Depends(db.get_db)):
    return db.query(models.Section).filter_by(wiki_id=wiki_id, page_id=page_id).order_by("section_index").all()


@router.post("/w/{wiki_id}/p/{page_id}/s", response_model=schemas.Section)
def wiki_sections(wiki_id:str, page_id: str, section_create: schemas.SectionCreate, db: db.Session = Depends(db.get_db)):
    with db.begin_nested():
        section = models.Section(
            wiki_id=wiki_id,
            page_id=page_id,
            content=section_create.content,
            section_index=section_create.section_index)
        db.add(section)
    return section


@router.patch("/w/{wiki_id}/p/{page_id}/s/{section_id}", response_model=schemas.Section)
def wiki_sections(wiki_id:str, page_id: str, section_id: int, section: schemas.SectionUpdate, db: db.Session = Depends(db.get_db)):
    updated_section = (
        db.query(models.Section)
        .filter_by(id=section_id, wiki_id=wiki_id, page_id=page_id)
        .order_by("section_index")
        .first()
    )
    if section.content is not None:
        updated_section.content = section.content
    if section.section_index is not None:
        updated_section.section_index = section.section_index
    db.commit()

    return updated_section
