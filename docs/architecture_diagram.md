# System Architecture Diagram

This document illustrates the actual architecture implemented for the **AI-Enabled Multi-Tenant User Management & Cloud Platform** in accordance with Section 14 of the specification.

```mermaid
flowchart TD
    subgraph ClientLayer ["Client & Access Layer"]
        Browser["User / Administrator<br>(Desktop / Mobile Web)"]
        CurlClient["API Consumer / CLI<br>(cURL / Postman / SDK)"]
    end

    subgraph IngressLayer ["Ingress & Reverse Proxy"]
        Cloudflare["Cloudflare Edge Tunnel<br>(HTTPS: trycloudflare.com)"]
        DockerPort["Port 5000 Listener<br>(Uvicorn ASGI Engine)"]
    end

    subgraph UnifiedApp ["Unified Application Runtime (Python FastAPI)"]
        StaticServer["Frontend SPA Static Server<br>(React 18 + Vite + Tailwind)"]
        APIRouter["FastAPI REST Router<br>(/api/v1)"]
        AuthMiddleware["JWT Tenant Isolation Dependency<br>(Header: Bearer Token)"]
        ActivityLogger["Activity Logging Middleware<br>(Intercepts every API call)"]
        SwaggerUI["Interactive OpenAPI Documentation<br>(/api-docs)"]
    end

    subgraph DataLayer ["Persistence & Cloud Integrations"]
        Supabase[("Supabase (PostgreSQL)<br>Table: clients<br>• client_id<br>• client_secret_hash (bcrypt)<br>• is_active, timestamps")]
        MongoDB[("MongoDB 7.0<br>Collections:<br>1. users (scoped by client_id)<br>2. activity_logs (audit stream)")]
        FirebaseAdmin["Firebase Admin SDK<br>Event & Notification Dispatcher<br>• USER_CREATED<br>• USER_DELETED"]
        LLMService["Google Gemini 1.5 Flash API<br>(HTTP via httpx)<br>AI Operational Log Summarizer"]
    end

    Browser --> Cloudflare
    CurlClient --> Cloudflare
    Cloudflare --> DockerPort
    DockerPort --> StaticServer
    DockerPort --> APIRouter
    DockerPort --> SwaggerUI

    APIRouter --> ActivityLogger
    APIRouter --> AuthMiddleware
    ActivityLogger -.->|Async write| MongoDB

    APIRouter -->|1. Client Registration & Token Exchange| Supabase
    APIRouter -->|2. Tenant Users CRUD (Scoped)| MongoDB
    APIRouter -->|3. Trigger Lifecycle Events| FirebaseAdmin
    APIRouter -->|4. Synthesize Activity Insights| LLMService
```

## Architectural Component Breakdown

1. **Client Layer**:
   - Authorized tenant administrators interact with the responsive React single-page dashboard.
   - External machines and programmatic scripts consume the REST API using Bearer JWT tokens.

2. **Ingress & Gateway**:
   - Secure Cloudflare Tunnel exposes the internal port `5000` via public SSL encryption without port forwarding.
   - FastAPI serves both the precompiled React single-page app and REST endpoints from the same origin to eliminate CORS complications.

3. **Multi-Tenant Security Enforcement**:
   - Client authentication checks credentials against bcrypt hashes in Supabase and issues a cryptographically signed JWT with the `client_id` claim.
   - Every database query to MongoDB is automatically scoped to `{"client_id": tenant["client_id"]}`, guaranteeing strict tenant boundary isolation.

4. **Distributed Storage Strategy**:
   - **Supabase (PostgreSQL)**: Handles strictly relational tenant identity and credential hashing where ACID guarantees are paramount.
   - **MongoDB**: Handles high-volume, flexible document-oriented user metadata and sequential request activity audit trails.
   - **Firebase Admin SDK**: Dispatches real-time lifecycle event notifications on user creation and deletion.
   - **Gemini LLM API**: Provides analytical operational summarization of recent request logs on demand.
