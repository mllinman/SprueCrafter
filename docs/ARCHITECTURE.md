# SprueCrafter - SaaS Architecture Overview

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer / Ingress                  │
│                    (Nginx / Cloud Load Balancer)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴─────────────┐
                │                          │
     ┌──────────▼────────┐      ┌─────────▼────────┐
     │   Web Frontend    │      │   Backend API     │
     │   (Node.js/       │      │   (Python Flask)  │
     │    Electron)      │      │                   │
     │                   │      │  - Authentication │
     │  - User Interface │      │  - File Processing│
     │  - 3D Viewer      │      │  - Sprue Gen      │
     │  - File Upload    │      │  - Rate Limiting  │
     └───────────────────┘      └─────────┬─────────┘
                                          │
                         ┌────────────────┼────────────────┐
                         │                │                │
                ┌────────▼─────┐  ┌──────▼──────┐  ┌─────▼──────┐
                │  PostgreSQL  │  │    Redis     │  │  S3 Storage│
                │              │  │              │  │            │
                │  - Users     │  │  - Sessions  │  │  - Files   │
                │  - Files     │  │  - Cache     │  │  - Models  │
                │  - Jobs      │  │  - Queues    │  │  - Uploads │
                └──────────────┘  └──────────────┘  └────────────┘
```

## Technology Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: PostgreSQL 15+
- **Cache/Sessions**: Redis 7+
- **Authentication**: JWT + API Keys
- **API Documentation**: OpenAPI/Swagger
- **Monitoring**: Prometheus metrics
- **Logging**: Structured logging with Sentry integration

### Frontend
- **Desktop**: Electron (for desktop application)
- **Web**: Modern HTML/CSS/JavaScript
- **3D Visualization**: Three.js
- **API Client**: Axios

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Cloud Storage**: AWS S3 (or compatible)

## Key SaaS Features

### 1. Multi-tenancy
- User isolation
- Per-user file storage
- Resource quotas by plan
- Tenant-specific configuration

### 2. Authentication & Authorization
- JWT-based authentication
- API key support
- Role-based access control (User/Admin)
- OAuth2 integration ready
- Session management

### 3. Subscription Management
- Multiple plans (Free, Pro, Enterprise)
- Feature gating by plan
- Usage tracking
- Billing integration ready

### 4. Scalability
- Horizontal pod autoscaling
- Load balancing
- Database connection pooling
- Caching layer
- CDN-ready static assets

### 5. Security
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection
- Secure file upload handling
- Encrypted secrets
- HTTPS/TLS support

### 6. Monitoring & Observability
- Health check endpoints
- Prometheus metrics
- Request/response logging
- Error tracking (Sentry)
- API usage analytics
- Performance monitoring

### 7. File Management
- Local storage option
- S3-compatible cloud storage
- Automatic file cleanup
- File versioning
- Secure download links
- Chunked uploads for large files

### 8. API Design
- RESTful API
- Consistent error handling
- API versioning
- Rate limiting
- Request validation
- Response caching

## Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- username (Unique)
- email (Unique)
- password_hash
- api_key (Unique)
- first_name, last_name, company
- is_active, is_admin, email_verified
- plan (free, pro, enterprise)
- created_at, updated_at, last_login
```

### Files Table
```sql
- id (UUID, Primary Key)
- user_id (Foreign Key)
- filename, original_filename
- file_type, file_size, mime_type
- storage_path, storage_type (local/s3)
- dimensions, vertex_count, face_count
- status (uploaded, processing, processed, failed)
- created_at, updated_at, expires_at
```

### Processing Jobs Table
```sql
- id (UUID, Primary Key)
- user_id (Foreign Key)
- file_id (Foreign Key)
- job_type (convert, scale, separate, sprue, etc.)
- status (pending, running, completed, failed)
- progress (0-100)
- parameters (JSON)
- result_file_id, result_data (JSON)
- error_message
- created_at, started_at, completed_at
```

### API Usage Table
```sql
- id (UUID, Primary Key)
- user_id (Foreign Key)
- endpoint, method, status_code
- response_time, request_size, response_size
- ip_address, user_agent
- created_at
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/api-key` - Regenerate API key

### File Operations (Authenticated)
- `POST /api/convert` - Convert file format
- `POST /api/scale` - Scale 3D model
- `POST /api/separate` - Separate parts
- `POST /api/generate-sprue` - Generate sprue
- `POST /api/transform` - Transform model
- `POST /api/generate-supports` - Generate supports
- `POST /api/photo-to-model` - Photo to 3D

### Information (Public)
- `GET /api/health` - Health check
- `GET /api/info` - API information
- `GET /api/connector-types` - Available connectors
- `GET /api/printer-profiles` - Printer profiles

### Admin (Admin Only)
- `GET /api/admin/users` - List users
- `GET /api/admin/stats` - System statistics

## Deployment Options

### 1. Docker Compose (Local/Development)
```bash
docker-compose up -d
```

### 2. Kubernetes (Production)
```bash
kubectl apply -f k8s-deployment.yaml
```

### 3. Cloud Platforms
- **AWS**: EKS + RDS + ElastiCache + S3
- **Google Cloud**: GKE + Cloud SQL + Memorystore + Cloud Storage
- **Azure**: AKS + Azure Database + Redis Cache + Blob Storage
- **DigitalOcean**: DOKS + Managed PostgreSQL + Managed Redis + Spaces

## Configuration

All configuration is managed through environment variables. See `.env.example` for complete list.

### Critical Settings
```bash
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=postgresql://user:pass@host/db
REDIS_URL=redis://host:6379
AWS_S3_BUCKET=your-bucket
```

## Monitoring

### Metrics Available
- Request count by endpoint
- Request duration
- Error rate
- Active users
- File upload size/count
- Processing job queue length
- Database connections
- Cache hit rate

### Health Checks
- Database connectivity
- Redis connectivity
- Disk space
- Memory usage
- API responsiveness

## Security Considerations

### Authentication
- Passwords hashed with werkzeug (PBKDF2)
- JWT tokens with expiration
- API keys for programmatic access
- Refresh token rotation

### API Security
- Rate limiting per user/IP
- CORS configuration
- Request size limits
- File type validation
- Input sanitization

### Data Protection
- Encrypted secrets in Kubernetes
- Encrypted data at rest (S3)
- Encrypted data in transit (HTTPS)
- Regular security audits
- Dependency vulnerability scanning

## Scalability Considerations

### Horizontal Scaling
- Stateless backend pods
- Session storage in Redis
- Shared file storage (S3)
- Database connection pooling

### Vertical Scaling
- Adjustable resource limits
- Memory/CPU requests and limits
- Database scaling (read replicas)
- Cache size configuration

### Performance Optimization
- Response caching
- Database query optimization
- Lazy loading
- Background job processing
- CDN for static assets

## Cost Optimization

### Resource Management
- Auto-scaling based on load
- Scheduled scaling (off-peak)
- Storage lifecycle policies
- Log retention policies

### Storage
- S3 Intelligent Tiering
- Automatic file cleanup
- Compressed backups
- Deduplicated storage

## Backup & Disaster Recovery

### Database Backups
- Daily automated backups
- Point-in-time recovery
- Cross-region replication
- Backup retention policy

### File Backups
- S3 versioning
- Cross-region replication
- Lifecycle policies
- Restore procedures

## Migration Path

### From Desktop to SaaS
1. Users create account
2. Upload existing projects
3. Access from any device
4. Collaborate with team
5. Cloud storage integration

### Hybrid Deployment
- Desktop app continues to work
- Optional cloud sync
- API integration
- Gradual migration

## Future Enhancements

### Planned Features
- Real-time collaboration
- Webhook notifications
- Advanced analytics dashboard
- Batch processing queue
- WebSocket support for live updates
- GraphQL API
- Mobile applications
- Plugin marketplace

### Enterprise Features
- SSO integration (SAML, OAuth)
- Custom branding
- Dedicated instances
- SLA guarantees
- Priority support
- Advanced analytics
- Audit logs
- Custom integrations

## Getting Started

### For Developers
1. Clone repository
2. Copy `.env.example` to `.env`
3. Run `docker-compose up`
4. Access http://localhost:3000

### For Deployment
1. Review `docs/DEPLOYMENT.md`
2. Configure environment variables
3. Set up infrastructure
4. Deploy using CI/CD pipeline

### For Users
1. Visit application URL
2. Register account
3. Upload 3D models
4. Generate sprues
5. Download results

## Support & Documentation

- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **API Documentation**: `/api/info` endpoint
- **User Guide**: `docs/USER_GUIDE.md`
- **Architecture**: `docs/ARCHITECTURE.md` (this file)
- **Contributing**: `CONTRIBUTING.md`

---

**SprueCrafter** - Enterprise-ready SaaS platform for professional 3D model sprue generation
