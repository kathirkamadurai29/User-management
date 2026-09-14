import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
import bcrypt
import jwt
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status
from config.supabase_client import get_client_by_client_id

router = APIRouter(prefix="/auth", tags=["Clients & Authentication"])

JWT_SECRET = os.getenv("JWT_SECRET", "development_jwt_secret_key_32_bytes_super_secure_random")
JWT_ALGORITHM = "HS256"


class AuthTokenRequest(BaseModel):
    client_id: str = Field(..., min_length=1)
    client_secret: str = Field(..., min_length=1)


class ClientInfo(BaseModel):
    client_id: str
    name: str
    email: Optional[str] = None


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: str = "24h"
    client: ClientInfo


@router.post(
    "/token",
    response_model=AuthTokenResponse,
    summary="Exchange client_id + client_secret for signed JWT",
)
async def exchange_token(body: AuthTokenRequest):
    client_id = body.client_id.strip()
    client_secret = body.client_secret.strip()

    # Query Supabase clients table
    record = await get_client_by_client_id(client_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Client credentials could not be verified."}},
        )

    if record.get("is_active") is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": {"code": "CLIENT_DEACTIVATED", "message": "This client account has been suspended."}},
        )

    # Compare bcrypt password hash
    stored_hash = record.get("client_secret_hash", "")
    try:
        is_match = bcrypt.checkpw(client_secret.encode("utf-8"), stored_hash.encode("utf-8"))
    except Exception:
        is_match = False

    if not is_match:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Client credentials could not be verified."}},
        )

    # Issue JWT signed with tenant claim
    now = datetime.now(timezone.utc)
    exp = now + timedelta(hours=24)

    token_payload = {
        "client_id": record["client_id"],
        "name": record.get("name", "Tenant"),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "iss": "user-management-platform",
        "aud": "tenant-api",
    }

    token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return AuthTokenResponse(
        access_token=token,
        token_type="Bearer",
        expires_in="24h",
        client=ClientInfo(
            client_id=record["client_id"],
            name=record.get("name", "Tenant"),
            email=record.get("email"),
        ),
    )
