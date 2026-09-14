# Google Cloud Platform (GCP) Deployment Guide

This guide details the deployment architecture on **Google Cloud Platform** to fulfill the bonus requirements outlined in **Section 8 (Google Cloud – Bonus)**.

---

## 1. Google Cloud Architecture Overview

The multi-tenant platform is designed to be fully cloud-native on GCP:

- **Google Cloud Run**: Serverless container hosting running our unified Docker container (`backend/Dockerfile`).
  - Auto-scales from 0 to N instances based on concurrent HTTP requests.
  - Automatic HTTPS/TLS management.
- **Google Artifact Registry**: Docker image repository hosting versioned container images.
- **Google Secret Manager**: Secure storage for sensitive keys (JWT secret, Supabase service role key, Gemini API key, Firebase credentials).
- **Google Firebase**: Cloud messaging and application events for tenant user lifecycle.
- **Google Cloud AI (Gemini 1.5 Flash)**: Foundation model accessed via REST endpoint for telemetry summarization.

---

## 2. Deployment Steps to Google Cloud Run

### Prerequisites
1. Google Cloud SDK (`gcloud` CLI) installed and logged in:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_GCP_PROJECT_ID
   ```
2. Enable required GCP APIs:
   ```bash
   gcloud services enable run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
   ```

### Step 1: Create Artifact Registry Repository
```bash
gcloud artifacts repositories create tenant-platform-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository for multi-tenant platform"
```

### Step 2: Build & Push Container Image
```bash
# Build and tag container
docker build -t us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/tenant-platform-repo/platform:latest -f backend/Dockerfile .

# Configure Docker credentials for GCP
gcloud auth configure-docker us-central1-docker.pkg.dev

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/tenant-platform-repo/platform:latest
```

### Step 3: Deploy to Cloud Run
```bash
gcloud run deploy tenant-core-platform \
    --image=us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/tenant-platform-repo/platform:latest \
    --region=us-central1 \
    --platform=managed \
    --allow-unauthenticated \
    --port=5000 \
    --set-env-vars="MONGODB_URI=your_mongodb_atlas_uri,SUPABASE_URL=your_supabase_url,SUPABASE_SERVICE_ROLE_KEY=your_key,JWT_SECRET=your_secret,GEMINI_API_KEY=your_gemini_key"
```

### Step 4: Access Cloud Run URL
Cloud Run outputs an immutable HTTPS URL:
```text
Service URL: https://tenant-core-platform-xyz-uc.a.run.app
```
Both the React Frontend SPA, REST API (`/api/v1`), and Swagger UI (`/api-docs`) will be accessible directly through this URL.
