# SprueCrafter - SaaS Deployment Guide

This guide provides comprehensive instructions for deploying SprueCrafter as a Software-as-a-Service (SaaS) application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Docker Deployment](#docker-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Cloud Provider Deployments](#cloud-provider-deployments)
7. [Configuration](#configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Security](#security)
10. [Maintenance](#maintenance)

## Overview

SprueCrafter has been enhanced with the following SaaS features:

- **Authentication & Authorization**: JWT-based authentication with API keys
- **Multi-tenancy**: User isolation with per-user file storage
- **Database**: PostgreSQL for persistent data storage
- **Caching**: Redis for session management and rate limiting
- **Rate Limiting**: API rate limits to prevent abuse
- **Monitoring**: Prometheus metrics and health checks
- **Cloud Storage**: S3-compatible storage for uploaded files
- **CI/CD**: Automated build, test, and deployment pipelines
- **Scalability**: Horizontal pod autoscaling and load balancing

## Prerequisites

### Required

- Docker 20.10+
- Docker Compose 2.0+ (for local development)
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### For Kubernetes Deployment

- Kubernetes 1.24+
- kubectl configured
- Helm 3.0+ (optional, for easier deployment)
- Ingress controller (nginx-ingress recommended)
- Cert-manager (for SSL certificates)

### For Production

- Domain name
- SSL certificate (or use Let's Encrypt)
- Cloud storage (AWS S3 or compatible)
- Container registry (GitHub Container Registry, Docker Hub, etc.)

## Local Development Setup

### 1. Clone and Configure

```bash
git clone https://github.com/mllinman/SprueCrafter.git
cd SprueCrafter

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your settings
```

### 2. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Initialize Database

```bash
# Access backend container
docker-compose exec backend bash

# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Create admin user
flask create-admin

# Exit container
exit
```

### 4. Access Application

- Web UI: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/info

## Docker Deployment

### Build Images

```bash
# Build backend image
docker build -f Dockerfile.backend -t sprucecrafter-backend:latest .

# Build web image
docker build -f Dockerfile.web -t sprucecrafter-web:latest .
```

### Run with Docker Compose

```bash
# Production mode
FLASK_ENV=production docker-compose up -d

# With custom configuration
docker-compose --env-file .env.production up -d
```

### Push to Registry

```bash
# Tag images
docker tag sprucecrafter-backend:latest ghcr.io/mllinman/sprucecrafter-backend:latest
docker tag sprucecrafter-web:latest ghcr.io/mllinman/sprucecrafter-web:latest

# Login to registry
docker login ghcr.io -u USERNAME -p TOKEN

# Push images
docker push ghcr.io/mllinman/sprucecrafter-backend:latest
docker push ghcr.io/mllinman/sprucecrafter-web:latest
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace sprucecrafter
```

### 2. Configure Secrets

```bash
# Create secrets from environment file
kubectl create secret generic sprucecrafter-secrets \
  --from-literal=SECRET_KEY="your-secret-key" \
  --from-literal=JWT_SECRET_KEY="your-jwt-secret" \
  --from-literal=POSTGRES_PASSWORD="your-db-password" \
  --from-literal=REDIS_PASSWORD="your-redis-password" \
  --from-literal=AWS_ACCESS_KEY_ID="your-aws-key" \
  --from-literal=AWS_SECRET_ACCESS_KEY="your-aws-secret" \
  -n sprucecrafter
```

### 3. Update Configuration

Edit `k8s-deployment.yaml`:
- Update domain name in Ingress
- Update image repositories
- Adjust resource limits
- Configure storage class

### 4. Deploy

```bash
# Apply configuration
kubectl apply -f k8s-deployment.yaml

# Check deployment status
kubectl get pods -n sprucecrafter
kubectl get services -n sprucecrafter
kubectl get ingress -n sprucecrafter

# View logs
kubectl logs -f deployment/sprucecrafter-backend -n sprucecrafter
```

### 5. Initialize Database

```bash
# Get backend pod name
POD=$(kubectl get pod -n sprucecrafter -l app=sprucecrafter-backend -o jsonpath="{.items[0].metadata.name}")

# Initialize database
kubectl exec -it $POD -n sprucecrafter -- flask db upgrade
kubectl exec -it $POD -n sprucecrafter -- flask create-admin
```

## Cloud Provider Deployments

### AWS (EKS)

```bash
# Create EKS cluster
eksctl create cluster \
  --name sprucecrafter \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.large \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 5

# Configure kubectl
aws eks update-kubeconfig --name sprucecrafter --region us-east-1

# Deploy application
kubectl apply -f k8s-deployment.yaml

# Configure S3 bucket
aws s3 mb s3://sprucecrafter-uploads
```

### Google Cloud (GKE)

```bash
# Create GKE cluster
gcloud container clusters create sprucecrafter \
  --region us-central1 \
  --num-nodes 3 \
  --machine-type n1-standard-2 \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 5

# Get credentials
gcloud container clusters get-credentials sprucecrafter --region us-central1

# Deploy application
kubectl apply -f k8s-deployment.yaml
```

### Azure (AKS)

```bash
# Create resource group
az group create --name sprucecrafter-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group sprucecrafter-rg \
  --name sprucecrafter \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group sprucecrafter-rg --name sprucecrafter

# Deploy application
kubectl apply -f k8s-deployment.yaml
```

### DigitalOcean (DOKS)

```bash
# Create cluster via web UI or doctl
doctl kubernetes cluster create sprucecrafter \
  --region nyc1 \
  --size s-2vcpu-4gb \
  --count 3

# Get credentials
doctl kubernetes cluster kubeconfig save sprucecrafter

# Deploy application
kubectl apply -f k8s-deployment.yaml
```

## Configuration

### Environment Variables

See `.env.example` for all available configuration options.

#### Critical Settings

```bash
# Security (CHANGE THESE!)
SECRET_KEY=your-unique-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://:password@host:6379/0

# AWS S3 (for file storage)
USE_S3=True
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# Feature Flags
ENABLE_REGISTRATION=True
ENABLE_PHOTO_TO_MODEL=True
```

### Database Migrations

```bash
# Create new migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback migration
flask db downgrade
```

## Monitoring & Logging

### Prometheus Metrics

Metrics are exposed at `/metrics` endpoint:

```bash
# Access metrics (from within cluster)
curl http://sprucecrafter-backend:5000/metrics
```

### Health Checks

```bash
# Check backend health
curl http://your-domain/api/health

# Expected response:
{
  "status": "ok",
  "message": "SprueCrafter API is running",
  "database": "ok",
  "version": "2.0.0"
}
```

### Logging

Logs are written to stdout/stderr and can be collected by:

- **Kubernetes**: Use kubectl logs or deploy logging stack (ELK, Loki)
- **Cloud**: Use cloud-native logging (CloudWatch, Stackdriver, Azure Monitor)
- **Sentry**: Configure SENTRY_DSN for error tracking

```bash
# View backend logs
kubectl logs -f deployment/sprucecrafter-backend -n sprucecrafter

# View web logs
kubectl logs -f deployment/sprucecrafter-web -n sprucecrafter
```

## Security

### Best Practices

1. **Change Default Secrets**: Update all default passwords and keys
2. **Use HTTPS**: Configure SSL/TLS certificates
3. **Enable Rate Limiting**: Prevent API abuse
4. **Regular Updates**: Keep dependencies up to date
5. **Backup Database**: Regular automated backups
6. **Restrict Access**: Use network policies and firewalls
7. **Monitor Logs**: Watch for suspicious activity
8. **API Keys**: Rotate keys regularly

### SSL/TLS Configuration

#### Using Let's Encrypt with cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourdomain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Firewall Rules

Recommended firewall configuration:

- Allow port 80 (HTTP) - for Let's Encrypt verification
- Allow port 443 (HTTPS) - for application access
- Restrict port 5432 (PostgreSQL) - database access only from application
- Restrict port 6379 (Redis) - cache access only from application
- Allow SSH (port 22) only from trusted IPs

## Maintenance

### Backup Strategy

#### Database Backup

```bash
# Manual backup
kubectl exec -it postgres-pod -n sprucecrafter -- \
  pg_dump -U sprucecrafter sprucecrafter > backup-$(date +%Y%m%d).sql

# Automated backup (cron job)
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: sprucecrafter
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15-alpine
            command:
            - /bin/sh
            - -c
            - pg_dump -h postgres -U sprucecrafter sprucecrafter > /backups/backup-\$(date +%Y%m%d-%H%M%S).sql
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: sprucecrafter-secrets
                  key: POSTGRES_PASSWORD
            volumeMounts:
            - name: backups
              mountPath: /backups
          volumes:
          - name: backups
            persistentVolumeClaim:
              claimName: backups-pvc
          restartPolicy: OnFailure
EOF
```

#### File Storage Backup

If using S3, enable versioning and lifecycle policies:

```bash
# Enable S3 versioning
aws s3api put-bucket-versioning \
  --bucket sprucecrafter-uploads \
  --versioning-configuration Status=Enabled

# Configure lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket sprucecrafter-uploads \
  --lifecycle-configuration file://lifecycle-policy.json
```

### Scaling

#### Manual Scaling

```bash
# Scale backend
kubectl scale deployment sprucecrafter-backend --replicas=5 -n sprucecrafter

# Scale web
kubectl scale deployment sprucecrafter-web --replicas=3 -n sprucecrafter
```

#### Auto-scaling

Auto-scaling is configured in `k8s-deployment.yaml` via HorizontalPodAutoscaler.

Adjust thresholds:

```yaml
spec:
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Updates and Upgrades

```bash
# Update backend image
kubectl set image deployment/sprucecrafter-backend \
  backend=ghcr.io/mllinman/sprucecrafter-backend:v2.0.1 \
  -n sprucecrafter

# Monitor rollout
kubectl rollout status deployment/sprucecrafter-backend -n sprucecrafter

# Rollback if needed
kubectl rollout undo deployment/sprucecrafter-backend -n sprucecrafter
```

### Troubleshooting

#### Check Pod Status

```bash
kubectl get pods -n sprucecrafter
kubectl describe pod <pod-name> -n sprucecrafter
kubectl logs <pod-name> -n sprucecrafter
```

#### Database Connection Issues

```bash
# Test database connectivity
kubectl exec -it <backend-pod> -n sprucecrafter -- \
  python -c "from config import get_config; from models import db; db.create_all(); print('DB OK')"
```

#### File Upload Issues

- Check disk space: `df -h`
- Verify permissions on upload directory
- Check S3 credentials and bucket policy
- Review rate limiting settings

## Support

For issues and questions:

- GitHub Issues: https://github.com/mllinman/SprueCrafter/issues
- Documentation: See `/docs` directory
- Community: Join discussions

---

**SprueCrafter** - Professional sprue generation for the modern scale modeler, now ready for SaaS deployment!
