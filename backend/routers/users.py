from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Literal
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, Depends, HTTPException, Query, status
from middleware.auth import get_current_tenant
from config.mongodb_client import get_db
from config.firebase_client import trigger_user_created_event, trigger_user_deleted_event

router = APIRouter(prefix="/users", tags=["Users Management"])


class UserCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    role: Literal["admin", "member", "viewer"] = "member"
    status: Literal["active", "inactive", "pending"] = "active"
    metadata: Optional[Dict[str, Any]] = None


class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    role: Optional[Literal["admin", "member", "viewer"]] = None
    status: Optional[Literal["active", "inactive", "pending"]] = None
    metadata: Optional[Dict[str, Any]] = None


class UserResponse(BaseModel):
    id: str = Field(..., alias="_id")
    client_id: str
    name: str
    email: str
    role: str
    status: str
    metadata: Optional[Dict[str, Any]] = None
    is_deleted: bool
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        populate_by_name = True


class UsersListResponse(BaseModel):
    users: List[Dict[str, Any]]
    total: int
    limit: int
    skip: int


def _clean_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    clean = dict(doc)
    if "_id" in clean:
        clean["_id"] = str(clean["_id"])
    return clean


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create user scoped strictly to authenticated tenant",
)
async def create_user(
    body: UserCreateRequest,
    tenant: Dict[str, Any] = Depends(get_current_tenant),
):
    client_id = tenant["client_id"]
    db = get_db()
    users_col = db["users"]

    # Check for duplicate email in this tenant
    existing = users_col.find_one({
        "client_id": client_id,
        "email": str(body.email).lower(),
        "is_deleted": False,
    })

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": {
                    "code": "USER_ALREADY_EXISTS",
                    "message": f"A user with email '{body.email}' already exists for this tenant.",
                }
            },
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    new_user = {
        "client_id": client_id,
        "name": body.name.strip(),
        "email": str(body.email).lower(),
        "role": body.role,
        "status": body.status,
        "metadata": body.metadata or {},
        "is_deleted": False,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    insert_res = users_col.insert_one(new_user)
    new_user["_id"] = str(insert_res.inserted_id)

    # Firebase event trigger
    await trigger_user_created_event(new_user)

    return _clean_doc(new_user)


@router.get(
    "",
    summary="List all users for current tenant with search and status filters",
)
async def list_users(
    search: Optional[str] = Query(None, description="Search keyword matching name or email"),
    status: Optional[str] = Query(None, description="Filter by status (active, inactive, pending, all)"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    tenant: Dict[str, Any] = Depends(get_current_tenant),
):
    client_id = tenant["client_id"]
    db = get_db()
    users_col = db["users"]

    # Hard tenant isolation filter
    query: Dict[str, Any] = {
        "client_id": client_id,
        "is_deleted": False,
    }

    if status and status != "all":
        query["status"] = status.lower()

    if search and search.strip():
        term = search.strip()
        query["$or"] = [
            {"name": {"$regex": term, "$options": "i"}},
            {"email": {"$regex": term, "$options": "i"}},
        ]

    cursor = users_col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = [_clean_doc(doc) for doc in cursor]
    total = users_col.count_documents(query)

    return {
        "users": items,
        "total": total,
        "limit": limit,
        "skip": skip,
    }


@router.get(
    "/{user_id}",
    summary="Get single user by ID ensuring strict tenant isolation",
)
async def get_user(
    user_id: str,
    tenant: Dict[str, Any] = Depends(get_current_tenant),
):
    client_id = tenant["client_id"]
    db = get_db()
    users_col = db["users"]

    query = {
        "_id": user_id,
        "client_id": client_id,
        "is_deleted": False,
    }

    user = users_col.find_one(query)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "USER_NOT_FOUND",
                    "message": "User does not exist or access was denied for this tenant.",
                }
            },
        )

    return _clean_doc(user)


@router.put(
    "/{user_id}",
    summary="Update tenant user by ID",
)
async def update_user(
    user_id: str,
    body: UserUpdateRequest,
    tenant: Dict[str, Any] = Depends(get_current_tenant),
):
    client_id = tenant["client_id"]
    db = get_db()
    users_col = db["users"]

    query = {
        "_id": user_id,
        "client_id": client_id,
        "is_deleted": False,
    }

    existing = users_col.find_one(query)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "USER_NOT_FOUND",
                    "message": "User does not exist or access was denied for this tenant.",
                }
            },
        )

    updates = {}
    if body.name is not None:
        updates["name"] = body.name.strip()
    if body.role is not None:
        updates["role"] = body.role
    if body.status is not None:
        updates["status"] = body.status
    if body.metadata is not None:
        updates["metadata"] = body.metadata
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    users_col.update_one(query, {"$set": updates})
    updated = users_col.find_one(query)

    return _clean_doc(updated)


@router.delete(
    "/{user_id}",
    summary="Soft delete / deactivate user by ID",
)
async def delete_user(
    user_id: str,
    tenant: Dict[str, Any] = Depends(get_current_tenant),
):
    client_id = tenant["client_id"]
    db = get_db()
    users_col = db["users"]

    query = {
        "_id": user_id,
        "client_id": client_id,
        "is_deleted": False,
    }

    existing = users_col.find_one(query)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "USER_NOT_FOUND",
                    "message": "User does not exist or access was denied for this tenant.",
                }
            },
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    users_col.update_one(query, {
        "$set": {
            "is_deleted": True,
            "status": "inactive",
            "deleted_at": now_iso,
            "updated_at": now_iso,
        }
    })

    await trigger_user_deleted_event(existing)

    return {
        "message": "User deactivated successfully",
        "id": user_id,
        "deleted_at": now_iso,
    }
