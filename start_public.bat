@echo off
echo ==========================================================
echo Starting Multi-Tenant Platform (Unified Frontend + Backend)
echo ==========================================================

cd /d "%~dp0"

echo [1/2] Launching Unified FastAPI Server on port 5000...
start "TenantCore Server" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 5000"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Cloudflare Tunnel for Global Internet Access...
if exist "%~dp0cloudflared.exe" (
    "%~dp0cloudflared.exe" tunnel --url http://localhost:5000
) else (
    echo cloudflared.exe not found in root. Access locally at http://localhost:5000
    pause
)
