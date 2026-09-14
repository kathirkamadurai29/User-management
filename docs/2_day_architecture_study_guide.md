# 2-Day Cloud & System Architecture Intensive Study Guide

> **Objective:** Master Docker, Container Networking, Multi-Tenant Isolation, Polyglot Persistence, Zero-Trust Ingress, and Cloud Deployment in **48 hours** with curated video tutorials, real codebase cross-references, and interview defense questions.

---

## 📅 48-Hour Study Schedule

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ DAY 1: CONTAINERS, NETWORKING & MULTI-TENANT ARCHITECTURE (6 - 8 Hours)               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Module 1 (Morning): Containerization Internals, Multi-Stage Builds & Docker Compose │
│ • Module 2 (Afternoon): Internal Bridge Networking, DNS Resolution & Storage Volumes   │
│ • Module 3 (Evening): Multi-Tenant SaaS Design & Cryptographic JWT Scoping             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ DAY 2: DATABASES, ZERO-TRUST INGRESS & CLOUD DEPLOYMENT (6 - 8 Hours)                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Module 4 (Morning): Polyglot Persistence: Relational (PostgreSQL) vs Document (Mongo)│
│ • Module 5 (Afternoon): Zero-Trust Ingress & Cloudflare Tunnels (Edge Architecture)    │
│ • Module 6 (Evening): Serverless Containers (Google Cloud Run) & Interview Defense     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Day 1 — Morning: Docker & Containerization Internals

### 1. Concepts to Master
- **Kernel Namespaces & Cgroups**: Containers are **not** virtual machines. They share the host OS kernel and use Linux namespaces (PID, NET, MNT) for isolation and cgroups for CPU/RAM throttling.
- **Layer Caching**: Docker builds images from top to bottom. If an early layer changes (e.g. `COPY . .`), all subsequent cached layers are invalidated. Placing `COPY package*.json` or `COPY requirements.txt` **before** code preserves the cache and speeds up builds from minutes to seconds.
- **Multi-Stage Builds**: Compiling code in a builder image and copying only the compiled artifacts into a slim runtime container (e.g. `alpine` or `slim`).

### 2. Code Cross-Reference in This Project
- [frontend/Dockerfile](file:///c:/Users/gamin/OneDrive/Documents/project%20management/frontend/Dockerfile): Look at lines 4–19. Notice the `builder` stage (`node:20-alpine`) compiles Vite, and the `runner` stage (`nginx:1.25-alpine`) only packages the `dist/` directory, shrinking the image from **~950MB** to **~25MB**.
- [backend/Dockerfile](file:///c:/Users/gamin/OneDrive/Documents/project%20management/backend/Dockerfile): Notice `COPY requirements.txt` is executed before `COPY . .` to maximize layer caching.

### 🎥 Curated Video Tutorials
1. **[Docker in 100 Seconds](https://www.youtube.com/watch?v=Gjnup-PuquQ)** (Fireship, 2 mins) — *High-level overview of containerization vs VMs.*
2. **[Docker Tutorial for Beginners](https://www.youtube.com/watch?v=3c-iBn73dDE)** (TechWorld with Nana, 2.5 hrs — watch first 45 mins) — *Deep dive on images, containers, Dockerfiles, and layers.*
3. **[Multi-Stage Docker Builds Explained](https://www.youtube.com/watch?v=Tcgn_Pms_d4)** (TechWorld with Nana, 12 mins) — *Why and how to produce lean production images.*

---

## Day 1 — Afternoon: Container Networking & Orchestration

### 1. Concepts to Master
- **Software-Defined Bridge Networks**: Docker containers run inside isolated virtual network namespaces. The `bridge` network creates a virtual switch inside your host.
- **Embedded DNS Service Discovery**: Docker runs an internal DNS daemon (`127.0.0.11`). Containers resolve service names (e.g. `mongodb:27017`) directly through DNS without hardcoded IP addresses.
- **Persistent Volumes vs Ephemeral Storage**: Container filesystems are destroyed when a container stops. Docker Named Volumes mount a managed host directory into the container to ensure zero data loss across restarts.
- **Healthcheck-Driven Dependency Graph**: `depends_on: service_healthy` prevents race conditions by waiting until a database responds to queries before starting dependent APIs.

### 2. Code Cross-Reference in This Project
- [docker-compose.yml](file:///c:/Users/gamin/OneDrive/Documents/project%20management/docker-compose.yml):
  - Look at lines 5–15: The `mongodb` healthcheck uses `mongosh --eval "db.adminCommand('ping')"` with retries.
  - Look at line 25: `MONGODB_URI: mongodb://mongodb:27017` uses service discovery.
  - Look at line 46: `mongo_data: driver: local` guarantees persistent disk storage.

### 🎥 Curated Video Tutorials
1. **[Docker Compose Tutorial](https://www.youtube.com/watch?v=SXwC9fSwct8)** (TechWorld with Nana, 30 mins) — *Complete walkthrough of multi-container orchestration.*
2. **[Docker Networking Explained](https://www.youtube.com/watch?v=bKFMS5C4CG0)** (Hussein Nasser, 20 mins) — *Bridge networks, host networks, port mapping, and packet routing.*
3. **[Docker Volumes in 6 Minutes](https://www.youtube.com/watch?v=p2PH_YPCZXo)** (Fireship, 6 mins) — *Why containers lose data and how volumes preserve it.*

---

## Day 1 — Evening: Multi-Tenant Architecture & Zero-Leakage Security

### 1. Concepts to Master
- **Multi-Tenant Models**:
  - *Database-per-tenant*: Maximum isolation, highest cost.
  - *Schema-per-tenant*: Logical database separation, complex migrations.
  - *Shared-database with Discriminator Key* (Our architecture): Highest density, lowest infrastructure cost, enforced at the query layer.
- **Cryptographic Tenant Isolation**: When a tenant logs in, their `client_id` is cryptographically signed inside a JWT token. They cannot tamper with their tenant ID without invalidating the cryptographic signature.
- **Query Scoping**: Every database read, update, or delete MUST automatically append `{"client_id": tenant["client_id"]}`.
- **Security by Design (404 vs 403)**: When a tenant queries another tenant's ID, return **HTTP 404 Not Found** (not 403 Forbidden). A 403 tells attackers the resource exists; a 404 conceals resource existence completely.

### 2. Code Cross-Reference in This Project
- [backend/middleware/auth.py](file:///c:/Users/gamin/OneDrive/Documents/project%20management/backend/middleware/auth.py): Lines 18–45 verify the Bearer token and inject `client_id`.
- [backend/routers/users.py](file:///c:/Users/gamin/OneDrive/Documents/project%20management/backend/routers/users.py): Lines 105–125 enforce `{"client_id": client_id, "is_deleted": False}` on all queries.
- [backend/routers/clients.py](file:///c:/Users/gamin/OneDrive/Documents/project%20management/backend/routers/clients.py): Lines 28–42 generate random credentials and salt/hash secrets with `bcrypt` (10 rounds).

### 🎥 Curated Video Tutorials
1. **[Multi-Tenant Architecture Explained](https://www.youtube.com/watch?v=5V_l6_7zQeM)** (ByteByteGo, 8 mins) — *The standard architectural models for multi-tenant SaaS.*
2. **[OAuth 2.0 and OpenID Connect in Plain English](https://www.youtube.com/watch?v=996OiexHze0)** (Nate Barbettini, 35 mins) — *The industry reference lecture on tokens, claims, and client credentials.*
3. **[JWT (JSON Web Token) Explained](https://www.youtube.com/watch?v=7Q17ubqLfaM)** (Hussein Nasser, 25 mins) — *Stateless authentication and token structure.*

---

## Day 2 — Morning: Polyglot Persistence (PostgreSQL vs MongoDB)

### 1. Concepts to Master
- **Polyglot Persistence**: The architectural pattern of using different database engines for different data needs within the same application.
- **Relational / ACID (PostgreSQL / Supabase)**:
  - Strict table schema, primary keys, foreign keys.
  - Ideal for tenant credentials and billing where duplicate IDs or unvalidated records break the security model.
- **Document / NoSQL (MongoDB)**:
  - Dynamic schemas (BSON/JSON documents).
  - Ideal for polymorphic user metadata (different tenants need different profile fields) and high-throughput append-only audit logs.

### 2. Code Cross-Reference in This Project
- [docs/database_architecture.md](file:///c:/Users/gamin/OneDrive/Documents/project%20management/docs/database_architecture.md): Complete rationale, sequence diagram, and trade-off comparison.
- [backend/config/supabase_client.py](file:///c:/Users/gamin/OneDrive/Documents/project%20management/backend/config/supabase_client.py): Relational client table persistence.
- [backend/config/mongodb_client.py](file:///c:/Users/gamin/OneDrive/Documents/project%20management/backend/config/mongodb_client.py): Document-oriented user and audit log persistence.

### 🎥 Curated Video Tutorials
1. **[SQL vs NoSQL in 100 Seconds](https://www.youtube.com/watch?v=ZS_kXvOeQ5Y)** (Fireship, 2 mins) — *Quick visual comparison.*
2. **[SQL vs NoSQL: How to Choose?](https://www.youtube.com/watch?v=cNpvgdfz3j0)** (ByteByteGo, 6 mins) — *System design evaluation criteria.*
3. **[MongoDB Tutorial for Beginners](https://www.youtube.com/watch?v=ofme2o29ngU)** (Amigoscode, 40 mins) — *Collections, BSON documents, indexes, and queries.*

---

## Day 2 — Afternoon: Zero-Trust Ingress & Cloudflare Tunnels

### 1. Concepts to Master
- **The Inherent Risk of Port Forwarding**: Opening port 80/443 on your home or office router exposes your public IP address to port scanners, brute force bots, and DDoS attacks.
- **Zero-Trust Outbound Tunnels**: `cloudflared` initiates an outbound connection (over UDP port 443 using the QUIC protocol) to Cloudflare's nearest edge data center.
- **Anycast Edge Routing**: When a user visits `https://your-tunnel.trycloudflare.com`, Cloudflare terminates the TLS certificate at the edge, screens for DDoS/bot attacks, and routes packets back through your pre-established outbound tunnel.
- **Single-Origin Unified Hosting**: Serving both the compiled SPA and API endpoints under the same port/origin eliminates Cross-Origin Resource Sharing (CORS) preflight roundtrips (`OPTIONS` requests).

### 2. Code Cross-Reference in This Project
- [backend/main.py](file:///c:/Users/gamin/OneDrive/Documents/project%20management/backend/main.py): Lines 65–85 mount `frontend/dist` as static assets and implement SPA fallback routing on port `5000`.
- [start_public.bat](file:///c:/Users/gamin/OneDrive/Documents/project%20management/start_public.bat): Launches the unified server and `cloudflared.exe` with a single click.

### 🎥 Curated Video Tutorials
1. **[Cloudflare Tunnels are AWESOME (and free)](https://www.youtube.com/watch?v=ey44Ft5-Ipw)** (NetworkChuck, 18 mins) — *How Cloudflare Tunnels work and why port forwarding is obsolete.*
2. **[What is a Reverse Proxy?](https://www.youtube.com/watch?v=07sxhf5q47U)** (Fireship, 4 mins) — *How reverse proxies protect backend origin servers.*

---

## Day 2 — Evening: Event-Driven Architecture & Serverless Deployment

### 1. Concepts to Master
- **Event-Driven Decoupling**: Rather than having the API synchronously call email services or push notification servers during a user creation request, the API emits a lightweight event (`USER_CREATED`) to an event bus (Firebase / PubSub).
- **Serverless Containers (Google Cloud Run)**:
  - Containers package code and OS libraries.
  - Cloud Run runs containers on demand, automatically scaling instances from **0 to N** based on concurrent incoming HTTP requests.
  - When idle, instances scale to **0** (incurring $0 cost).
- **12-Factor Stateless Application**: Containers must be ephemeral and store zero persistent state on local disk. All persistence is delegated to managed databases (Supabase & MongoDB Atlas).

### 2. Code Cross-Reference in This Project
- [backend/config/firebase_client.py](file:///c:/Users/gamin/OneDrive/Documents/project%20management/backend/config/firebase_client.py): Asynchronous event broadcasting to tenant topics (`tenant_<client_id>`).
- [docs/gcp_cloud_run.md](file:///c:/Users/gamin/OneDrive/Documents/project%20management/docs/gcp_cloud_run.md): Step-by-step commands to build, push to Artifact Registry, and deploy to Cloud Run.

### 🎥 Curated Video Tutorials
1. **[Event-Driven Architecture Explained](https://www.youtube.com/watch?v=rJZXp4vW7w4)** (ByteByteGo, 7 mins) — *Synchronous vs Asynchronous event communication.*
2. **[Google Cloud Run in 100 Seconds](https://www.youtube.com/watch?v=gvvybQsnx4o)** (Fireship, 2 mins) — *How serverless container scaling works.*
3. **[Deploy Any Container to Google Cloud Run](https://www.youtube.com/watch?v=1F2l4W_F-yI)** (TechWorld with Nana, 18 mins) — *Practical Cloud Run deployment workflow.*

---

## 🎯 Top 10 Architecture Defense Questions (Interview Prep)

Be prepared to answer these questions during your technical review or presentation:

#### 1. Why did you choose a single shared database for tenants instead of creating a separate database for each client?
> *"A shared database with a discriminator key (`client_id`) maximizes resource density and minimizes infrastructure costs. Creating a database per tenant introduces significant operational overhead when scaling to thousands of clients and makes running schema migrations across all tenants difficult. We enforced hard isolation mathematically at the gateway layer using cryptographically signed JWT claims."*

#### 2. How do you guarantee Tenant A cannot read Tenant B's data?
> *"We enforce zero-trust isolation in two layers: First, the JWT token is signed with a server-side secret and contains the tenant's `client_id` claim, which cannot be forged. Second, every database query automatically injects `{"client_id": tenant["client_id"]}` into the filter criteria. If a tenant queries another tenant's user ID, the database returns no matching document, resulting in an HTTP 404 response."*

#### 3. Why return HTTP 404 instead of HTTP 403 when cross-tenant access is attempted?
> *"Returning HTTP 403 tells an attacker that the record exists but they lack permissions, enabling ID enumeration attacks. Returning HTTP 404 conceals the existence of other tenants' data entirely."*

#### 4. Why use multi-stage Docker builds?
> *"Multi-stage builds separate the build environment (which requires Node.js, npm, and devDependencies) from the production runtime environment (which only requires compiled static assets and an Nginx binary). This reduces the final image size by over 95% and removes package managers and compilers, significantly reducing the security attack surface."*

#### 5. How do containers communicate in Docker Compose without hardcoded IP addresses?
> *"Docker Compose creates a software-defined bridge network and runs an embedded DNS server at `127.0.0.11`. Containers resolve each other using service names (e.g. `mongodb:27017`), which Docker dynamically resolves to the container's internal private IP."*

#### 6. Why did you use both Supabase and MongoDB instead of just one?
> *"This follows the Polyglot Persistence pattern. Client credentials require strict relational integrity, ACID compliance, and unique constraints, which PostgreSQL excels at. Conversely, user entities have dynamic metadata, and request activity logging generates high-volume append-only traffic, which MongoDB's document model handles with higher write throughput and zero migration friction."*

#### 7. Why is storing bcrypt hashes safer than encrypting client secrets?
> *"Encryption is two-way: if an attacker obtains the decryption key, all client secrets are compromised. Bcrypt is a one-way salted cryptographic hash function. Even if an attacker dumps the entire database, the original secret cannot be reversed. The authentication system compares raw secrets by hashing them with the stored salt and checking for equality."*

#### 8. How does the Cloudflare Tunnel make the application accessible globally without port forwarding?
> *"Traditional port forwarding requires opening router ports and exposing public IPs to internet scanners. Cloudflare Tunnel establishes an outbound-only QUIC/TLS connection from our local machine to Cloudflare's nearest edge server. Inbound traffic reaches Cloudflare's DDoS-protected edge, which routes it through our pre-established outbound tunnel. Our local firewall keeps all inbound ports closed."*

#### 9. Why mount the frontend directly in the FastAPI application?
> *"Serving both the React SPA and the REST API from the same origin on port 5000 eliminates Cross-Origin Resource Sharing (CORS) preflight requests, simplifies deployment to a single container, and ensures all relative API calls (`/api/v1/...`) work automatically across any domain without configuration."*

#### 10. How does the system handle Firebase notifications without slowing down user creation?
> *"We implemented an asynchronous event trigger (`trigger_user_created_event`). The user record is committed to MongoDB first, and the event notification is dispatched asynchronously to a tenant-specific Firebase topic (`tenant_<client_id>`). If Firebase is slow or unreachable, the HTTP user creation response returns immediately in milliseconds without failing."*

---

## 📂 Codebase Artifact Checklist

All relevant documentation and configurations are accessible in your repository:
- 📖 [README.md](file:///c:/Users/gamin/OneDrive/Documents/project%20management/README.md) — *Complete 17-section project overview.*
- 📐 [docs/architecture_diagram.md](file:///c:/Users/gamin/OneDrive/Documents/project%20management/docs/architecture_diagram.md) — *Visual Mermaid architecture flowchart.*
- 🗄️ [docs/database_architecture.md](file:///c:/Users/gamin/OneDrive/Documents/project%20management/docs/database_architecture.md) — *Polyglot persistence deep dive and sequence diagrams.*
- ☁️ [docs/gcp_cloud_run.md](file:///c:/Users/gamin/OneDrive/Documents/project%20management/docs/gcp_cloud_run.md) — *Google Cloud Run bonus deployment guide.*
- 🎤 [docs/technical_presentation.md](file:///c:/Users/gamin/OneDrive/Documents/project%20management/docs/technical_presentation.md) — *17-slide technical presentation script.*
- 📮 [docs/postman_collection.json](file:///c:/Users/gamin/OneDrive/Documents/project%20management/docs/postman_collection.json) — *Exportable Postman API collection.*
- 🚀 [start_public.bat](file:///c:/Users/gamin/OneDrive/Documents/project%20management/start_public.bat) — *1-click launcher for server and public tunnel.*
