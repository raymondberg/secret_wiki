from typing import List

from fastapi import APIRouter, Depends, HTTPException

import secret_wiki.models.wiki as models
from secret_wiki import schemas
from secret_wiki.db import AsyncSession, get_async_session

from .auth import fastapi_users

router = APIRouter(prefix="/api")

current_active_user = fastapi_users.current_user(active=True)


@router.get("/w", response_model=List[schemas.Wiki])
async def list_wikis(
    db: AsyncSession = Depends(get_async_session),
    _: schemas.User = Depends(current_active_user),
):
    wikis = await db.execute(models.Wiki.all())
    return wikis.scalars().all()


@router.get("/w/{wiki_id}/p", response_model=List[schemas.Page])
async def list_wiki_pages(
    wiki_id: str,
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    pages = await db.execute(models.Page.filter(wiki_id=wiki_id, user=user))
    return pages.scalars().all()


@router.post("/w/{wiki_id}/p", response_model=schemas.Page)
async def create_wiki_page(
    wiki_id: str,
    page_create: schemas.PageCreate,
    db: AsyncSession = Depends(get_async_session),
    _: schemas.User = Depends(current_active_user),
):
    async with db.begin_nested():
        page = models.Page(
            wiki_id=wiki_id,
            id=page_create.id,
            title=page_create.title,
            is_admin_only=page_create.is_admin_only,
        )
        db.add(page)
    return page


@router.get("/w/{wiki_id}/p/{page_id}", response_model=schemas.Page)
async def read_page(
    wiki_id: str,
    page_id: str,
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    page_result = await db.execute(models.Page.filter(wiki_id=wiki_id, page_id=page_id, user=user))
    page = page_result.scalars().first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.get("/w/{wiki_id}/p/{page_id}/s", response_model=List[schemas.Section])
async def wiki_sections(
    wiki_id: str,
    page_id: str,
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    sections = await db.execute(
        models.Section.filter(wiki_id=wiki_id, page_id=page_id, user=user).order_by(
            "section_index"
        )
    )
    return sections.scalars().all()


@router.post("/w/{wiki_id}/p/{page_id}/s", response_model=schemas.Section)
async def wiki_section_create(
    wiki_id: str,
    page_id: str,
    section_create: schemas.SectionCreate,
    db: AsyncSession = Depends(get_async_session),
    _: schemas.User = Depends(current_active_user),
):
    async with db.begin_nested():
        section = models.Section(
            wiki_id=wiki_id,
            page_id=page_id,
            is_admin_only=section_create.is_admin_only,
            content=section_create.content,
            section_index=section_create.section_index,
        )
        db.add(section)
        if section.is_admin_only:
            if section.permissions is None:
                raise HTTPException(
                    status_code=422, detail="Must specify permissions if restricted"
                )
            await section.set_permissions(db, section_create.permissions)
    return section


@router.post("/w/{wiki_id}/p/{page_id}/s/{section_id}", response_model=schemas.Section)
async def update_section(
    wiki_id: str,
    page_id: str,
    section_id: int,
    section: schemas.SectionUpdate,
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    query = models.Section.filter(
        section_id=section_id, wiki_id=wiki_id, page_id=page_id, user=user
    ).order_by("section_index")
    section_result = await db.execute(query)
    updated_section = section_result.scalars().first()
    if not updated_section or not user.can_update_section(updated_section):
        raise HTTPException(status_code=404, detail="Section not found")
    # updated_section.update_if_present(section)

    updated_section.update(section)

    async with db.begin_nested():
        db.add(updated_section)
        await db.commit()

    section_result = await db.execute(query)
    return section_result.scalars().first()
