from typing import List

import sqlalchemy.exc
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


async def get_section(
    section_id: str,
    db: AsyncSession = Depends(get_async_session),
) -> AsyncGenerator[models.Section, None]:
    section = await models.Section.get(section_id, db=db)
    if not section:
        raise HTTPException(status_code=404, detail="no such section")
    return section


async def get_section_for_update(
    section: models.Section = Depends(get_section),
    user: schemas.User = Depends(current_active_user),
) -> AsyncGenerator[models.Section, None]:
    if not user.can_update_section(section):
        raise HTTPException(status_code=404, detail="Section not found")
    return section


@router.get("/w", response_model=List[schemas.Wiki])
async def list_wikis(
    db: AsyncSession = Depends(get_async_session),
    _: schemas.User = Depends(current_active_user),
):
    wikis = await db.execute(models.Wiki.all())
    return wikis.scalars().all()


@router.get("/w/{wiki_slug}/search", response_model=List[schemas.SearchResult])
async def search_wiki(
    q: str,
    wiki_object: models.Wiki = Depends(get_wiki),
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    search_results = await models.get_search_results(wiki_object.id, q, user)
    return search_results


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
            is_secret=page_create.is_secret,
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


@router.post("/w/{wiki_slug}/p/{page_slug}", response_model=schemas.Page)
async def update_page(
    wiki_slug: str,
    page_slug: str,
    page: schemas.PageUpdate,
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    page_result = await db.execute(
        models.Page.filter(wiki_slug=wiki_slug, page_slug=page_slug, user=user)
    )
    page_to_update = page_result.scalars().first()
    if not page_to_update:
        raise HTTPException(status_code=404, detail="Page not found")

    async with db.begin_nested():
        page_to_update.update(page)
        db.add(page_to_update)
    await db.refresh(page_to_update)
    return page_to_update


@router.post("/w/{wiki_slug}/p/{page_slug}/fanout", response_model=List[schemas.Section])
async def fanout_page(
    wiki_slug: str,
    page_slug: str,
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    page_result = await db.execute(
        models.Page.filter(wiki_slug=wiki_slug, page_slug=page_slug, user=user)
    )
    page_to_update = page_result.scalars().first()
    if not page_to_update:
        raise HTTPException(status_code=404, detail="Page not found")

    return await page_to_update.fanout()


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
            is_secret=section_create.is_secret,
            content=section_create.content,
            section_index=section_create.section_index,
        )
        if section.is_secret:
            if section.permissions is None:
                raise HTTPException(
                    status_code=422, detail="Must specify permissions if restricted"
                )
        db.add(section)
        await db.commit()

    await db.refresh(section)
    await section.set_permissions(*section_create.permissions or [])
    async with db.begin_nested():
        db.add(section)
        await db.commit()
    return await models.Section.get(section.id)


@router.post("/w/{wiki_slug}/p/{page_slug}/s/{section_id}", response_model=schemas.Section)
async def update_section(
    update_request: schemas.SectionUpdate,
    section: models.Section = Depends(get_section_for_update),
    db: AsyncSession = Depends(get_async_session),
):
    async with db.begin_nested():
        section.update(update_request)
        db.add(section)
    await section.set_permissions(*update_request.permissions or [])
    await db.refresh(section)
    return section


@router.delete("/w/{wiki_slug}/p/{page_slug}/s/{section_id}")
async def delete_section(
    section: models.Section = Depends(get_section_for_update),
    db: AsyncSession = Depends(get_async_session),
):
    db.sync_session.delete(section)
    await db.commit()
    return Response(status_code=204)
