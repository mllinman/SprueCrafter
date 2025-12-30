# SprueCrafter - SaaS Deployment Quick Start

## 🚀 New: SaaS Deployment Support!

SprueCrafter now supports full SaaS deployment with enterprise-grade features including authentication, database persistence, cloud storage, and horizontal scaling.

## Quick Start Options

### Option 1: Local Development (Docker Compose)

The fastest way to get started:

```bash
# Clone the repository
git clone https://github.com/mllinman/SprueCrafter.git
cd SprueCrafter

# Run setup script
./setup-saas.sh

# Or manually:
cp .env.example .env
# Edit .env with your settings
docker-compose up -d

# Access the application
# Web UI: http://localhost:3000
# API: http://localhost:5000
```

### Option 2: Production Deployment (Kubernetes)

For production SaaS deployment:

```bash
# Configure secrets
kubectl create namespace sprucecrafter
kubectl create secret generic sprucecrafter-secrets \
  --from-literal=SECRET_KEY="your-secret" \
  --from-literal=POSTGRES_PASSWORD="your-password" \
  -n sprucecrafter

# Deploy
kubectl apply -f k8s-deployment.yaml

# Check status
kubectl get pods -n sprucecrafter
```

## What's New in SaaS Version?

### 🔐 Authentication & Security
- JWT-based user authentication
- API key support for programmatic access
- Role-based access control (User/Admin)
- Rate limiting to prevent abuse
- CORS configuration
- Secure file upload handling

### 💾 Database & Persistence
- PostgreSQL for user data and metadata
- Redis for caching and sessions
- File tracking and versioning
- Processing job queue management

### ☁️ Cloud Ready
- S3-compatible cloud storage
- Horizontal pod autoscaling
- Load balancing support
- Multi-region deployment
- CDN integration ready

### 📊 Monitoring & Observability
- Prometheus metrics
- Health check endpoints
- Structured logging
- Sentry error tracking
- API usage analytics

### 🔄 CI/CD Pipeline
- Automated testing
- Docker image builds
- Security scanning
- Automated deployments
- Rollback capabilities

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Load Balancer / Ingress             │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┴─────────┐
    │                    │
┌───▼──────┐      ┌──────▼───────┐
│   Web    │      │   Backend    │
│ Frontend │      │   API        │
└──────────┘      └──────┬───────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
      ┌─────▼──┐   ┌────▼───┐   ┌───▼────┐
      │PostgreSQL│  │ Redis │   │   S3   │
      └─────────┘   └────────┘   └────────┘
```

## API Authentication

### Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "myuser",
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "myuser",
    "password": "securepassword"
  }'
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "...",
    "username": "myuser",
    "email": "user@example.com",
    "plan": "free"
  }
}
```

### Use API with Token

```bash
curl -X POST http://localhost:5000/api/convert \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@model.obj" \
  -F "format=stl"
```

## Configuration

All configuration is done via environment variables. Copy `.env.example` to `.env` and update:

```bash
# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/sprucecrafter

# Redis
REDIS_URL=redis://:password@host:6379/0

# AWS S3 (optional)
USE_S3=True
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket

# Features
ENABLE_REGISTRATION=True
RATELIMIT_ENABLED=True
```

## Deployment Guides

### Local Development
See: [Quick Start](#option-1-local-development-docker-compose) above

### Cloud Deployment
Detailed guides available for:
- **AWS (EKS)**: Elastic Kubernetes Service
- **Google Cloud (GKE)**: Google Kubernetes Engine
- **Azure (AKS)**: Azure Kubernetes Service
- **DigitalOcean (DOKS)**: DigitalOcean Kubernetes

See `docs/DEPLOYMENT.md` for complete instructions.

## Migration from Desktop

If you're currently using the desktop version:

1. **Keep Desktop App**: Both versions can coexist
2. **Test SaaS**: Try locally with Docker Compose
3. **Migrate Data**: Upload existing projects
4. **Switch Gradually**: Use both during transition

See `docs/MIGRATION_GUIDE.md` for detailed migration instructions.

## Monitoring

### Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "message": "SprueCrafter API is running",
  "database": "ok",
  "version": "2.0.0"
}
```

### Metrics

Prometheus metrics available at `/metrics` endpoint (restricted in production).

## Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment sprucecrafter-backend --replicas=5 -n sprucecrafter

# Scale web
kubectl scale deployment sprucecrafter-web --replicas=3 -n sprucecrafter
```

### Auto-scaling

Horizontal Pod Autoscaler is configured in `k8s-deployment.yaml`:
- Min replicas: 3
- Max replicas: 10
- CPU target: 70%
- Memory target: 80%

## Security

### Best Practices
1. ✅ Change all default secrets
2. ✅ Use HTTPS/TLS in production
3. ✅ Enable rate limiting
4. ✅ Regular backups
5. ✅ Keep dependencies updated
6. ✅ Monitor logs for suspicious activity
7. ✅ Rotate API keys regularly

### SSL/TLS

For production, configure SSL with Let's Encrypt:

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Configure in Ingress (see k8s-deployment.yaml)
```

## Pricing (Example)

### Free Tier
- ✅ 1 GB storage
- ✅ Basic features
- ✅ 10 conversions/month
- ✅ Community support

### Pro Tier ($9.99/month)
- ✅ 50 GB storage
- ✅ All features
- ✅ Unlimited conversions
- ✅ Priority support
- ✅ API access

### Enterprise Tier (Custom)
- ✅ Unlimited storage
- ✅ Custom features
- ✅ Dedicated resources
- ✅ SLA guarantee
- ✅ Custom integrations

## Documentation

- **📖 Deployment Guide**: `docs/DEPLOYMENT.md` - Complete deployment instructions
- **🏗️ Architecture**: `docs/ARCHITECTURE.md` - System architecture and design
- **🔄 Migration Guide**: `docs/MIGRATION_GUIDE.md` - Migrate from desktop to SaaS
- **📚 User Guide**: `docs/USER_GUIDE.md` - How to use SprueCrafter
- **🔧 API Reference**: `docs/API.md` - API documentation

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs -f

# Or for Kubernetes
kubectl logs -f deployment/sprucecrafter-backend -n sprucecrafter
```

### Database Connection Issues

```bash
# Test database connection
docker-compose exec backend flask db upgrade

# Or check PostgreSQL
docker-compose exec db psql -U sprucecrafter -d sprucecrafter
```

### File Upload Issues

- Check `MAX_CONTENT_LENGTH` in `.env`
- Verify disk space or S3 credentials
- Review rate limiting settings

## Contributing

We welcome contributions! Whether it's:
- 🐛 Bug reports
- 💡 Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions

See `CONTRIBUTING.md` for guidelines.

## Support

- **📧 Issues**: [GitHub Issues](https://github.com/mllinman/SprueCrafter/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/mllinman/SprueCrafter/discussions)
- **📖 Documentation**: See `docs/` directory
- **🌐 Website**: Coming soon

## License

MIT License - See LICENSE file for details

---

**SprueCrafter** - Professional 3D Model to Sprue Conversion Tool, now ready for SaaS deployment! 🚀
