import os
import jwt
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status

JWT_SECRET = os.getenv("JWT_SECRET", "development_jwt_secret_key_32_bytes_super_secure_random")
JWT_ALGORITHM = "HS256"


async def get_current_tenant(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Missing or malformed Authorization header. Expected Bearer <token>",
                }
            },
        )

    token = authorization.split(" ")[1].strip()

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"verify_aud": False},
        )
        client_id = payload.get("client_id")
        if not client_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": {
                        "code": "INVALID_TOKEN",
                        "message": "Token does not contain a valid tenant client_id claim",
                    }
                },
            )
        return {
            "client_id": client_id,
            "name": payload.get("name", "Tenant"),
            "iat": payload.get("iat"),
            "exp": payload.get("exp"),
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "TOKEN_EXPIRED",
                    "message": "JWT access token has expired. Please re-authenticate via POST /auth/token",
                }
            },
        )
    except jwt.PyJWTError as e:
        print("[JWT Debug Error]", type(e), e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "INVALID_TOKEN",
                    "message": f"JWT token signature is invalid or corrupted: {e}",
                }
            },
        )
