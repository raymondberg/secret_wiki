from typing import List

from fastapi import APIRouter, Depends

from secret_wiki import schemas
from secret_wiki.db import AsyncSession, User, get_async_session

from .common import current_active_user

router = APIRouter(prefix="/api")


@router.get("/u", response_model=List[schemas.PublicUser])
async def list_users(
    db: AsyncSession = Depends(get_async_session),
    user: schemas.User = Depends(current_active_user),
):
    return await User.all()
