# SaaS Deployment Guide

This guide explains how to deploy SprueCrafter as a SaaS application.

## Prerequisites
*   **Database**: PostgreSQL
*   **Object Storage**: AWS S3 (or MinIO)
*   **Payment**: Stripe Account
*   **Container Runtime**: Docker / Kubernetes

## Configuration
Edit `.env` (or set environment variables) with the following SaaS-specific keys:

```bash
# Feature Flags
ENABLE_REGISTRATION=true
REQUIRE_EMAIL_VERIFICATION=true

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/spruecrafter

# Stripe (Billing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# Storage (S3)
USE_S3=true
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=spruecrafter-uploads
```

## Running the Stack
1.  **Backend**:
    ```bash
    gunicorn -w 4 -b 0.0.0.0:5000 src.backend.app_saas:app
    ```

2.  **Frontend**:
    Build the optimized production bundle:
    ```bash
    cd frontend
    npm run build
    npm start
    ```

## Subscriptions
*   The `Pro` plan logic is handled in `app_saas.py`.
*   Webhooks are received at `/api/stripe/webhook`.
*   To test locally, use the Stripe CLI to forward webhooks:
    ```bash
    stripe listen --forward-to localhost:5000/api/stripe/webhook
    ```
