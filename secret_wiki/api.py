from typing import List


from fastapi import Depends, APIRouter

from . import db, models, schemas

router = APIRouter(prefix="/api")

@router.get("/w", response_model=List[schemas.Wiki])
def root(db: db.Session = Depends(db.get_db)):
    return db.query(models.Wiki).all()


@router.get("/w/{wiki_id}/p", response_model=List[schemas.Page])
def wiki(wiki_id: str, db: db.Session = Depends(db.get_db)):
    return db.query(models.Page).filter_by(wiki_id=wiki_id).order_by("title").all()


@router.get("/w/{wiki_id}/p/{page_id}", response_model=schemas.Page)
def wiki_page(wiki_id: str, page_id: str, db: db.Session = Depends(db.get_db)):
    return db.query(models.Page).filter_by(wiki_id=wiki_id, id=page_id).first()


@router.get("/w/{wiki_id}/p/{page_id}/s", response_model=List[schemas.Section])
def wiki_page(wiki_id:str, page_id: str, db: db.Session = Depends(db.get_db)):
    return db.query(models.Section).filter_by(wiki_id=wiki_id, page_id=page_id).order_by("section_index").all()
