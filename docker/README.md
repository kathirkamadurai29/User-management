# Docker Deployment Instructions

This repository contains a full multi-container stack orchestrated via Docker Compose:
- **`backend`**: Node.js 20 Express REST API on port `5000` (documented via Swagger at `/api-docs`).
- **`frontend`**: React + Vite + Tailwind SPA served through Nginx on port `5173`.
- **`mongodb`**: Official MongoDB 7.0 database service on port `27017` with persistent volumes.

## Quick Start

1. Ensure Docker Desktop / Docker Engine is running on your machine.
2. From the project root, launch the entire platform:
   ```bash
   docker compose up --build
   ```
3. Access the web services:
   - **Frontend Application**: [http://localhost:5173](http://localhost:5173)
   - **Backend REST API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
   - **Interactive Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## Environment Variables

To customize environment variables for Docker:
1. Copy `docker/.env.docker.example` to `.env` in the project root:
   ```bash
   cp docker/.env.docker.example .env
   ```
2. Populate any live cloud keys (Supabase, Firebase, Gemini API) as desired.
