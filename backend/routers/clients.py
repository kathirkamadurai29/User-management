import secrets
import bcrypt
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, status, HTTPException
from config.supabase_client import insert_client

router = APIRouter(prefix="/clients", tags=["Clients & Authentication"])


class ClientRegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Organization or Client name")
    email: Optional[EmailStr] = Field(None, description="Contact email address")


class ClientRegisterResponse(BaseModel):
    client_id: str
    client_secret: str
    name: str
    email: Optional[str] = None
    created_at: str
    message: str


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=ClientRegisterResponse,
    summary="Register a new tenant client",
)
async def register_client(body: ClientRegisterRequest):
    try:
        # Generate secure client_id and raw client_secret
        client_id = f"cli_{secrets.token_hex(10)}"
        raw_secret = f"sec_{secrets.token_hex(24)}"

        # Bcrypt hash secret
        salt = bcrypt.gensalt(rounds=10)
        secret_hash = bcrypt.hashpw(raw_secret.encode("utf-8"), salt).decode("utf-8")

        # Persist into Supabase clients table
        stored = await insert_client(
            client_id=client_id,
            client_secret_hash=secret_hash,
            name=body.name.strip(),
            email=str(body.email).strip().lower() if body.email else None,
        )

        return ClientRegisterResponse(
            client_id=stored["client_id"],
            client_secret=raw_secret,
            name=stored["name"],
            email=stored.get("email"),
            created_at=stored["created_at"],
            message="Client registered successfully. Please securely save the client_secret; it will not be shown again.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "REGISTRATION_ERROR", "message": str(e)}},
        )
