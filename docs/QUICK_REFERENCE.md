# SprueCrafter SaaS - Developer Quick Reference

## Quick Commands

### Local Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart a service
docker-compose restart backend

# Execute command in container
docker-compose exec backend bash
docker-compose exec backend flask db upgrade
```

### Database Operations

```bash
# Create migration
docker-compose exec backend flask db migrate -m "Description"

# Apply migrations
docker-compose exec backend flask db upgrade

# Rollback migration
docker-compose exec backend flask db downgrade

# Create admin user
docker-compose exec backend flask create-admin

# Access PostgreSQL
docker-compose exec db psql -U sprucecrafter -d sprucecrafter
```

### Kubernetes Operations

```bash
# Apply configuration
kubectl apply -f k8s-deployment.yaml

# Get resources
kubectl get pods -n sprucecrafter
kubectl get services -n sprucecrafter
kubectl get deployments -n sprucecrafter

# View logs
kubectl logs -f deployment/sprucecrafter-backend -n sprucecrafter
kubectl logs -f deployment/sprucecrafter-web -n sprucecrafter

# Execute command
kubectl exec -it POD_NAME -n sprucecrafter -- bash

# Port forward
kubectl port-forward service/sprucecrafter-backend 5000:5000 -n sprucecrafter

# Scale deployment
kubectl scale deployment sprucecrafter-backend --replicas=5 -n sprucecrafter

# Delete resources
kubectl delete -f k8s-deployment.yaml
```

## API Examples

### Authentication

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Get current user
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Regenerate API key
curl -X POST http://localhost:5000/api/auth/api-key \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### File Operations

```bash
# Convert file
curl -X POST http://localhost:5000/api/convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@model.obj" \
  -F "format=stl" \
  -o output.stl

# Scale model
curl -X POST http://localhost:5000/api/scale \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@model.stl" \
  -F "scale=0.02857" \
  -F "unit=mm" \
  -o scaled.stl

# Separate parts
curl -X POST http://localhost:5000/api/separate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@model.stl"

# Generate sprue
curl -X POST http://localhost:5000/api/generate-sprue \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@model.stl" \
  -F "build_plate_x=192" \
  -F "build_plate_y=120" \
  -F "build_plate_z=245" \
  -F "connector_type=cylindrical" \
  -o sprue.stl
```

### System Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# API info
curl http://localhost:5000/api/info

# Connector types
curl http://localhost:5000/api/connector-types

# Printer profiles
curl http://localhost:5000/api/printer-profiles

# Metrics (Prometheus)
curl http://localhost:5000/metrics
```

## Environment Variables

### Required
```bash
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://:pass@host:6379/0
```

### Optional
```bash
# AWS S3
USE_S3=True
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
AWS_REGION=us-east-1

# Features
ENABLE_REGISTRATION=True
ENABLE_PHOTO_TO_MODEL=True
ENABLE_CLOUD_STORAGE=False

# Rate Limiting
RATELIMIT_ENABLED=True
RATELIMIT_DEFAULT=100 per hour

# Monitoring
LOG_LEVEL=INFO
SENTRY_DSN=your-sentry-dsn
```

## Docker Commands

### Build Images

```bash
# Backend
docker build -f Dockerfile.backend -t sprucecrafter-backend:latest .

# Web
docker build -f Dockerfile.web -t sprucecrafter-web:latest .

# Build and push
docker tag sprucecrafter-backend:latest ghcr.io/user/sprucecrafter-backend:latest
docker push ghcr.io/user/sprucecrafter-backend:latest
```

### Run Containers

```bash
# Run backend
docker run -d \
  --name sprucecrafter-backend \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  sprucecrafter-backend:latest

# Run web
docker run -d \
  --name sprucecrafter-web \
  -p 3000:3000 \
  -e BACKEND_URL=http://backend:5000 \
  sprucecrafter-web:latest
```

## Troubleshooting

### Backend not starting

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait and retry
# 2. Missing environment variables - check .env
# 3. Port already in use - change port or stop conflicting service
```

### Database connection errors

```bash
# Test connection
docker-compose exec backend python -c "from config import get_config; print(get_config().SQLALCHEMY_DATABASE_URI)"

# Check PostgreSQL
docker-compose exec db psql -U sprucecrafter -d sprucecrafter -c "SELECT 1;"

# Reset database
docker-compose down -v
docker-compose up -d
docker-compose exec backend flask db upgrade
```

### File upload issues

```bash
# Check upload folder permissions
docker-compose exec backend ls -la /app/uploads

# Check disk space
docker-compose exec backend df -h

# Check S3 credentials
docker-compose exec backend python -c "import boto3; print(boto3.client('s3').list_buckets())"
```

### Redis connection errors

```bash
# Test Redis
docker-compose exec redis redis-cli -a YOUR_PASSWORD ping

# Check Redis logs
docker-compose logs redis

# Clear cache
docker-compose exec redis redis-cli -a YOUR_PASSWORD FLUSHALL
```

## Testing

### Backend Tests

```bash
# Run all tests
docker-compose exec backend pytest

# Run with coverage
docker-compose exec backend pytest --cov=. --cov-report=html

# Run specific test
docker-compose exec backend pytest tests/test_auth.py

# Run linter
docker-compose exec backend flake8 .
```

### API Tests

```bash
# Using curl
./tests/api-tests.sh

# Using pytest with requests
docker-compose exec backend pytest tests/test_api.py

# Load testing
ab -n 1000 -c 10 http://localhost:5000/api/health
```

## Monitoring

### View Metrics

```bash
# Prometheus metrics
curl http://localhost:5000/metrics

# Key metrics:
# - flask_http_request_duration_seconds
# - flask_http_request_total
# - process_cpu_seconds_total
# - process_resident_memory_bytes
```

### Check Health

```bash
# Overall health
curl http://localhost:5000/api/health

# Database health
docker-compose exec backend python -c "from models import db; db.session.execute('SELECT 1')"

# Redis health
docker-compose exec redis redis-cli -a PASSWORD ping
```

## Backup & Restore

### Database Backup

```bash
# Create backup
docker-compose exec db pg_dump -U sprucecrafter sprucecrafter > backup.sql

# Restore backup
cat backup.sql | docker-compose exec -T db psql -U sprucecrafter sprucecrafter
```

### File Backup

```bash
# Backup uploads
docker cp sprucecrafter-backend:/app/uploads ./uploads-backup

# Restore uploads
docker cp ./uploads-backup sprucecrafter-backend:/app/uploads
```

## Security

### Generate Secrets

```bash
# Random secret
openssl rand -base64 32

# UUID
python -c "import uuid; print(uuid.uuid4())"

# Update .env
sed -i 's/SECRET_KEY=.*/SECRET_KEY='$(openssl rand -base64 32)'/' .env
```

### SSL/TLS

```bash
# Generate self-signed certificate (development only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Use with nginx
# Update nginx.conf with ssl_certificate paths
```

## Performance

### Database Optimization

```bash
# Analyze tables
docker-compose exec db psql -U sprucecrafter -d sprucecrafter -c "ANALYZE;"

# Check indexes
docker-compose exec db psql -U sprucecrafter -d sprucecrafter -c "SELECT * FROM pg_indexes WHERE schemaname = 'public';"

# Vacuum
docker-compose exec db psql -U sprucecrafter -d sprucecrafter -c "VACUUM ANALYZE;"
```

### Redis Optimization

```bash
# Check memory usage
docker-compose exec redis redis-cli -a PASSWORD INFO memory

# Get cache stats
docker-compose exec redis redis-cli -a PASSWORD INFO stats
```

## Deployment Checklist

- [ ] Update all secrets in .env
- [ ] Configure database backups
- [ ] Set up monitoring/alerting
- [ ] Configure SSL/TLS certificates
- [ ] Test authentication flow
- [ ] Test file upload/download
- [ ] Configure rate limiting
- [ ] Set up log aggregation
- [ ] Test scaling (if using K8s)
- [ ] Configure domain/DNS
- [ ] Test disaster recovery
- [ ] Document access procedures

## Resources

- **Main README**: [README.md](../README.md)
- **SaaS Guide**: [SAAS_README.md](../SAAS_README.md)
- **Deployment**: [docs/DEPLOYMENT.md](DEPLOYMENT.md)
- **Architecture**: [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- **Migration**: [docs/MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **API Docs**: [docs/API.md](API.md)

---

**Quick Reference v2.0** - SprueCrafter SaaS Edition
