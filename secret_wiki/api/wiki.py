from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import relationship

import secret_wiki.models.wiki as models
from secret_wiki import schemas
from secret_wiki.db import AsyncGenerator, AsyncSession, get_async_session

from .auth import fastapi_users
from .common import current_active_user

router = APIRouter(prefix="/api")


async def get_wiki(
    wiki_slug: str, db: AsyncSession = Depends(get_async_session)
) -> AsyncGenerator[models.Wiki, None]:
    query = models.Wiki.all().filter_by(slug=wiki_slug)
    wiki = (await db.execute(query)).scalars().first()
    if not wiki:
        raise HTTPException(status_code=404, detail="no such wiki")
    return wiki


async def get_page(
    wiki_slug: str,
    page_slug: str,
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
) -> AsyncGenerator[models.Wiki, None]:
    query = models.Page.filter(wiki_slug=wiki_slug, page_slug=page_slug, user=user)
    page = (await db.execute(query)).scalars().first()
    if not page:
        raise HTTPException(status_code=404, detail="no such wiki or page")
    return page


@router.get("/w", response_model=List[schemas.Wiki])
async def list_wikis(
    db: AsyncSession = Depends(get_async_session),
    _: schemas.User = Depends(current_active_user),
):
    wikis = await db.execute(models.Wiki.all())
    return wikis.scalars().all()


@router.get("/w/{wiki_slug}/p", response_model=List[schemas.Page])
async def list_wiki_pages(
    wiki_slug: str,
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    return (await db.execute(models.Page.filter(wiki_slug=wiki_slug, user=user))).scalars().all()


@router.post("/w/{wiki_slug}/p", response_model=schemas.Page)
async def create_wiki_page(
    page_create: schemas.PageCreate,
    db: AsyncSession = Depends(get_async_session),
    wiki_object: models.Wiki = Depends(get_wiki),
    _: schemas.User = Depends(current_active_user),
):
    async with db.begin_nested():
        page = models.Page(
            wiki_id=wiki_object.id,
            id=page_create.id,
            slug=page_create.slug,
            title=page_create.title,
            is_admin_only=page_create.is_admin_only,
        )
        db.add(page)
    return page


@router.get("/w/{wiki_slug}/p/{page_slug}", response_model=schemas.Page)
async def read_page(
    wiki_slug: str,
    page_slug: str,
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    page_result = await db.execute(
        models.Page.filter(wiki_slug=wiki_slug, page_slug=page_slug, user=user)
    )
    page = page_result.scalars().first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.get("/w/{wiki_slug}/p/{page_slug}/s", response_model=List[schemas.Section])
async def wiki_sections(
    wiki_slug: str,
    page_slug: str,
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    sections = (
        (
            await db.execute(
                models.Section.filter(
                    wiki_slug=wiki_slug, page_slug=page_slug, user=user
                ).order_by("section_index")
            )
        )
        .scalars()
        .unique()
        .all()
    )
    return sections


@router.post("/w/{wiki_slug}/p/{page_slug}/s", response_model=schemas.Section)
async def wiki_section_create(
    section_create: schemas.SectionCreate,
    db: AsyncSession = Depends(get_async_session),
    page_object: models.Wiki = Depends(get_page),
    _: schemas.User = Depends(current_active_user),
):
    async with db.begin_nested():
        section = models.Section(
            id=section_create.id,
            page_id=page_object.id,
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
        await db.commit()
    async with db.begin_nested():
        await db.refresh(section)
        await section.set_permissions(*section_create.permissions or [])
        db.add(section)
    return await models.Section.get(section.id)


@router.post("/w/{wiki_slug}/p/{page_slug}/s/{section_id}", response_model=schemas.Section)
async def update_section(
    section_id: str,
    section: schemas.SectionUpdate,
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    section_result = await db.execute(
        models.Section.filter(section_id=section_id, user=user).order_by("section_index")
    )
    updated_section = section_result.scalars().first()
    if not updated_section or not user.can_update_section(updated_section):
        raise HTTPException(status_code=404, detail="Section not found")

    async with db.begin_nested():
        updated_section.update(section)
        db.add(updated_section)
    await updated_section.set_permissions(*section.permissions or [], db=db)
    await db.refresh(updated_section)
    return updated_section


@router.delete("/w/{wiki_slug}/p/{page_slug}/s/{section_id}")
async def delete_section(
    section_id: str,
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    query = models.Section.filter(section_id=section_id, user=user).order_by("section_index")
    section = (await db.execute(query)).scalars().first()
    if not section or not user.can_update_section(section):
        raise HTTPException(status_code=404, detail="Section not found")
    db.sync_session.delete(section)
    await db.commit()
    return Response(status_code=204)
