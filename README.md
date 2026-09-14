# AI-Enabled Multi-Tenant User Management & Cloud Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_7.0-47A248?logo=mongodb)](https://www.mongodb.com)
[![Supabase](https://img.shields.io/badge/Auth_DB-Supabase_(PostgreSQL)-3ECF8E?logo=supabase)](https://supabase.com)
[![Firebase](https://img.shields.io/badge/Events-Firebase_Admin-FFCA28?logo=firebase)](https://firebase.google.com)
[![Docker](https://img.shields.io/badge/DevOps-Docker_Compose-2496ED?logo=docker)](https://www.docker.com)

A production-ready, full-stack multi-tenant platform featuring hard tenant boundary isolation, bcrypt client credentials authentication, isolated user CRUD in MongoDB, request telemetry logging, Firebase Admin event dispatching, and AI operational log summarization via Google Gemini LLM.

---

## 1. Project Overview
This repository provides a unified multi-tenant identity and user management platform. It allows multiple independent client organizations (tenants) to register, obtain secure credentials, manage their user base with hard data isolation, monitor API telemetry, and generate executive operational summaries via an LLM.

## 2. Problem Statement
SaaS platforms and modern cloud enterprises must guarantee strict multi-tenant boundary isolation so that tenant data is never leaked or accessed across accounts. Additionally, organizations need automated credential rotation, real-time audit logging, lifecycle notifications, and programmatic API documentation without code complexity or high maintenance overhead.

## 3. Features
- **Client Onboarding & Credentials**: Self-service tenant registration returning a `client_id` and one-time raw `client_secret` (stored as a bcrypt hash in Supabase).
- **JWT Authentication & Tenant Scoping**: JWT tokens embed the `client_id` claim, enforcing hard query-level isolation across all CRUD endpoints.
- **Tenant Users CRUD (MongoDB)**: Create, retrieve, update, and soft-delete users with real-time keyword search (`?search=`) and lifecycle status filtering (`?status=active|inactive|pending`).
- **Activity Logging & Telemetry**: Every incoming API call is intercepted and recorded in MongoDB `activity_logs` with response codes and latency.
- **Firebase Admin SDK Events**: Dispatches `USER_CREATED` and `USER_DELETED` topic notifications on user lifecycle milestones.
- **AI Operational Insights**: `GET /api/v1/insights` calls Google Gemini 1.5 Flash to synthesize recent operational logs into concise executive summaries.
- **Unified Single-Origin Dashboard**: React SPA served directly alongside FastAPI on a single port (`5000`) with zero CORS complications.
- **Interactive Swagger UI**: Live OpenAPI 3.0 documentation at `/api-docs`.

## 4. Architecture
```
[ Client / Browser ] ─── HTTPS ───> [ Cloudflare Public Edge ]
                                              │
                                              ▼
                             [ Unified FastAPI Server :5000 ]
                             ├── React SPA (Static Files)
                             ├── REST APIs (/api/v1/*)
                             └── Swagger UI (/api-docs)
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
[ Supabase PostgreSQL ]      [ MongoDB 7.0 Document ]       [ Google Cloud ]
  • clients table              • users (scoped)               • Gemini 1.5 Flash
  • bcrypt secret hashes       • activity_logs (audit)        • Firebase Admin SDK
```

## 5. Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS (plain SVGs, custom 1px border neutral aesthetic).
- **Backend**: Python 3.14 / 3.11, FastAPI, Uvicorn, Pydantic, PyJWT, Bcrypt, HTTPX.
- **Databases**: Supabase (PostgreSQL 15) & MongoDB 7.0.
- **Cloud & DevOps**: Docker, Docker Compose, Cloudflare Tunnel, Google Cloud Run ready.
- **AI & Messaging**: Google Gemini 1.5 Flash, Firebase Admin SDK.

## 6. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: v3.11+ (Python 3.14 verified)
- **Docker**: Docker Engine or Docker Desktop (for containerized deployments)

## 7. Local Setup

### Option A: 1-Click Unified Runner (Windows)
Double-click `start_public.bat` in the project root:
- Automatically launches the unified FastAPI server on port `5000`.
- Launches a secure Cloudflare Tunnel providing an instant worldwide public HTTPS URL.

### Option B: Manual Setup

1. **Clone Repository**:
   ```bash
   git clone <repository_url>
   cd "project management"
   ```

2. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

3. **Setup Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn main:app --host 0.0.0.0 --port 5000
   ```

4. Open `http://localhost:5000/` in your browser.

## 8. Environment Variables
Create a `.env` file in the `backend/` directory using `backend/.env.example`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `5000` |
| `JWT_SECRET` | Secret key for signing tenant JWT tokens | `min-32-chars-secret` |
| `JWT_EXPIRES_IN` | Token validity duration | `24h` |
| `SUPABASE_URL` | Supabase project URL (optional: fallback used if empty) | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role API Key | `secret-key` |
| `MONGODB_URI` | MongoDB connection string (optional: fallback used if empty) | `mongodb://127.0.0.1:27017` |
| `MONGODB_DB_NAME` | MongoDB database name | `user_platform` |
| `FIREBASE_PROJECT_ID` | Firebase project identifier | `project-id` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `service-account@iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key string | `"-----BEGIN PRIVATE KEY-----..."` |
| `GEMINI_API_KEY` | Google AI Studio Gemini API Key | `api-key` |

## 9. Database Setup
1. **Supabase (PostgreSQL)**:
   - Navigate to the Supabase SQL Editor.
   - Run the SQL script located in [backend/schema.sql](file:///c:/Users/gamin/OneDrive/Documents/project%20management/backend/schema.sql).
2. **MongoDB**:
   - Indexes on `(client_id, is_deleted)` and `(client_id, timestamp)` are initialized automatically by the application on boot.

## 10. Firebase Setup
1. Download your Firebase Service Account JSON from the Firebase Console.
2. Either place it in `backend/` as `serviceAccountKey.json` or populate `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in `.env`.
3. If credentials are not provided, the platform gracefully switches to simulated event broadcasting.

## 11. AI Setup
1. Obtain an API key from Google AI Studio: [https://aistudio.google.com/](https://aistudio.google.com/).
2. Set `GEMINI_API_KEY=your_key` in `.env`.
3. The platform uses Gemini 1.5 Flash to synthesize request logs into operational summaries.

## 12. Docker Setup
Launch the complete multi-container stack (Backend, Frontend, MongoDB) with Docker Compose:
```bash
docker compose up --build
```
Access points:
- **Frontend SPA**: `http://localhost:5173` (or `http://localhost:5000`)
- **Backend API**: `http://localhost:5000/api/v1`
- **Swagger UI**: `http://localhost:5000/api-docs`

## 13. API Documentation
- **Interactive Swagger UI**: `http://localhost:5000/api-docs`
- **OpenAPI 3.0 Specification**: `http://localhost:5000/api/v1/openapi.json`
- **Postman Collection**: Exportable collection available at [docs/postman_collection.json](file:///c:/Users/gamin/OneDrive/Documents/project%20management/docs/postman_collection.json).

## 14. Deployment Instructions
- **Google Cloud Run**: See [docs/gcp_cloud_run.md](file:///c:/Users/gamin/OneDrive/Documents/project%20management/docs/gcp_cloud_run.md) for automated build and deploy instructions.
- **Docker Hosts**: Compatible with Render, Railway, and Fly.io via root `docker-compose.yml` and `Dockerfile`.

## 15. Public URLs
- **Live Unified Platform (Frontend SPA)**: [https://colors-privilege-congress-dow.trycloudflare.com/](https://colors-privilege-congress-dow.trycloudflare.com/)
- **Live Swagger Documentation**: [https://colors-privilege-congress-dow.trycloudflare.com/api-docs](https://colors-privilege-congress-dow.trycloudflare.com/api-docs)
- **Live Health Check**: [https://colors-privilege-congress-dow.trycloudflare.com/health](https://colors-privilege-congress-dow.trycloudflare.com/health)

## 16. Known Limitations
- Temporary Cloudflare Quick Tunnels do not provide custom domain persistence across machine restarts (fixed by using named tunnels with a Cloudflare token).
- SQLite/in-memory fallback persistence is designed for local development and demonstration; production requires active Supabase and MongoDB connection strings.

## 17. Future Improvements
- Multi-factor authentication (MFA) support for tenant administrators.
- WebSocket / SSE streaming for real-time audit log live feeds.
- Automated token rotation and OAuth2 refresh token flows.
