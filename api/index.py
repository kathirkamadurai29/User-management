import os
import sys

# Ensure root and backend directories are on sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

try:
    from main import app
except Exception as e:
    import traceback
    err_tb = traceback.format_exc()
    print(f"[Vercel Startup Error]: {err_tb}")
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI(title="Error Fallback")

    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def error_fallback(full_path: str):
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "STARTUP_ERROR", "message": str(e), "traceback": err_tb}}
        )
