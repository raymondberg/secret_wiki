from typing import List

from fastapi import APIRouter, Depends, HTTPException

from secret_wiki import models, schemas
from secret_wiki.db import Session, get_db

from .auth import fastapi_users

router = APIRouter(prefix="/api")

current_active_user = fastapi_users.current_user(active=True)


@router.get("/w", response_model=List[schemas.Wiki])
def root(
    db: Session = Depends(get_db),
    _: schemas.User = Depends(current_active_user),
):
    return db.query(models.Wiki).all()


@router.get("/w/{wiki_id}/p", response_model=List[schemas.Page])
def wiki(
    wiki_id: str,
    db: Session = Depends(get_db),
    user: schemas.User = Depends(current_active_user),
):
    return models.Page.filter(db, wiki_id=wiki_id, user=user).order_by("title").all()


@router.post("/w/{wiki_id}/p", response_model=schemas.Page)
def wiki_pages(
    wiki_id: str,
    page_create: schemas.PageCreate,
    db: Session = Depends(get_db),
    _: schemas.User = Depends(current_active_user),
):
    with db.begin_nested():
        page = models.Page(
            wiki_id=wiki_id,
            id=page_create.id,
            title=page_create.title,
            is_admin_only=page_create.is_admin_only,
        )
        db.add(page)
    return page


@router.get("/w/{wiki_id}/p/{page_id}", response_model=schemas.Page)
def wiki_page(
    wiki_id: str,
    page_id: str,
    db: Session = Depends(get_db),
    user: schemas.User = Depends(current_active_user),
):
    page = models.Page.filter(db, wiki_id=wiki_id, user=user).filter_by(id=page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.get("/w/{wiki_id}/p/{page_id}/s", response_model=List[schemas.Section])
def wiki_sections(
    wiki_id: str,
    page_id: str,
    db: Session = Depends(get_db),
    user: schemas.User = Depends(current_active_user),
):
    return (
        models.Section.filter(db, wiki_id=wiki_id, page_id=page_id, user=user)
        .order_by("section_index")
        .all()
    )


@router.post("/w/{wiki_id}/p/{page_id}/s", response_model=schemas.Section)
def wiki_section_create(
    wiki_id: str,
    page_id: str,
    section_create: schemas.SectionCreate,
    db: Session = Depends(get_db),
    _: schemas.User = Depends(current_active_user),
):
    with db.begin_nested():
        section = models.Section(
            wiki_id=wiki_id,
            page_id=page_id,
            is_admin_only=section_create.is_admin_only,
            content=section_create.content,
            section_index=section_create.section_index,
        )
        db.add(section)
    return section


@router.post("/w/{wiki_id}/p/{page_id}/s/{section_id}", response_model=schemas.Section)
def wiki_sections(
    wiki_id: str,
    page_id: str,
    section_id: int,
    section: schemas.SectionUpdate,
    db: Session = Depends(get_db),
    user: schemas.User = Depends(current_active_user),
):
    updated_section = (
        models.Section.filter(
            db, section_id=section_id, wiki_id=wiki_id, page_id=page_id, user=user
        )
        .order_by("section_index")
        .first()
    )
    if not updated_section or not user.can_update_section(updated_section):
        raise HTTPException(status_code=404, detail="Section not found")
    # updated_section.update_if_present(section)
    updated_section.update(section)
    db.commit()

    return updated_section
