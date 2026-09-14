import os
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from dotenv import load_dotenv

env_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
if os.path.exists(env_file):
    load_dotenv(env_file)
else:
    load_dotenv()

supabase_url = os.getenv("SUPABASE_URL", "").strip()
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

_supabase_client = None
is_configured = False

FALLBACK_FILE = (
    os.path.join(os.environ.get("TMPDIR", "/tmp"), ".clients_fallback.json")
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")
    else os.path.join(os.path.dirname(__file__), "..", ".clients_fallback.json")
)


def _read_local_clients():
    try:
        if os.path.exists(FALLBACK_FILE):
            with open(FALLBACK_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"[Supabase Fallback] Error reading storage: {e}")
    return []


def _write_local_clients(clients):
    try:
        with open(FALLBACK_FILE, "w", encoding="utf-8") as f:
            json.dump(clients, f, indent=2)
    except Exception as e:
        print(f"[Supabase Fallback] Error writing storage: {e}")


if supabase_url and supabase_key and supabase_url.startswith("http"):
    try:
        from supabase import create_client
        _supabase_client = create_client(supabase_url, supabase_key)
        is_configured = True
        print(f"[Supabase] Connected to {supabase_url}")
    except Exception as e:
        print(f"[Supabase] Connection warning: {e}. Using resilient fallback store.")
else:
    print("[Supabase] SUPABASE_URL / KEY not set. Operating in local resilient store mode.")


async def insert_client(client_id: str, client_secret_hash: str, name: str, email: Optional[str] = None) -> Dict[str, Any]:
    new_client = {
        "client_id": client_id,
        "client_secret_hash": client_secret_hash,
        "name": name,
        "email": email,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True,
    }

    if is_configured and _supabase_client:
        try:
            res = _supabase_client.table("clients").insert(new_client).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            print(f"[Supabase] Insert error ({e}), storing in resilient fallback.")

    clients = _read_local_clients()
    for c in clients:
        if c.get("client_id") == client_id:
            raise ValueError(f"Client {client_id} already exists")
    clients.append(new_client)
    _write_local_clients(clients)

    return {
        "client_id": new_client["client_id"],
        "name": new_client["name"],
        "email": new_client["email"],
        "created_at": new_client["created_at"],
        "is_active": new_client["is_active"],
    }


async def get_client_by_client_id(client_id: str) -> Optional[Dict[str, Any]]:
    if is_configured and _supabase_client:
        try:
            res = _supabase_client.table("clients").select("*").eq("client_id", client_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"[Supabase] Query error ({e}), reading from resilient fallback.")

    clients = _read_local_clients()
    for c in clients:
        if c.get("client_id") == client_id:
            return c
    return None
