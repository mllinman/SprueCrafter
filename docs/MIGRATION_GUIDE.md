# Migration Guide: Desktop to SaaS

This guide helps you migrate from the desktop version of SprueCrafter to the SaaS deployment.

## Overview

SprueCrafter now supports both desktop and SaaS deployment models:

- **Desktop**: Traditional Electron app running locally
- **SaaS**: Web-based application with cloud hosting

## Why Migrate to SaaS?

### Benefits
- **Access Anywhere**: Work from any device with internet access
- **Automatic Updates**: Always get the latest features
- **Cloud Storage**: Never lose your work
- **Collaboration**: Share projects with team members
- **Scalability**: Handle larger files with cloud resources
- **No Installation**: Use directly from web browser

### Desktop vs SaaS Feature Comparison

| Feature | Desktop | SaaS |
|---------|---------|------|
| 3D File Conversion | ✅ | ✅ |
| Scale Conversion | ✅ | ✅ |
| Part Separation | ✅ | ✅ |
| Sprue Generation | ✅ | ✅ |
| Support Generation | ✅ | ✅ |
| Photo to 3D | ✅ | ✅ |
| User Authentication | ❌ | ✅ |
| Cloud Storage | ❌ | ✅ |
| API Access | ❌ | ✅ |
| Team Collaboration | ❌ | ✅ (Coming Soon) |
| Mobile Access | ❌ | ✅ (Coming Soon) |

## Migration Options

### Option 1: Run SaaS Locally (Recommended for Testing)

Test the SaaS version on your local machine before deploying to production.

```bash
# Clone the repository
git clone https://github.com/mllinman/SprueCrafter.git
cd SprueCrafter

# Run setup script
./setup-saas.sh

# Start with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

### Option 2: Deploy to Cloud

Deploy SprueCrafter to a cloud provider for full SaaS experience.

#### Prerequisites
- Cloud account (AWS, Google Cloud, Azure, or DigitalOcean)
- Domain name (optional but recommended)
- Basic Kubernetes knowledge (for production deployment)

#### Quick Deploy Steps
1. Choose cloud provider
2. Set up Kubernetes cluster
3. Configure environment variables
4. Deploy using Kubernetes manifests
5. Configure DNS and SSL

See `docs/DEPLOYMENT.md` for detailed instructions.

### Option 3: Hybrid Approach

Keep using desktop app while also using SaaS for specific features.

- Desktop app for offline work
- SaaS for collaboration and cloud features
- Sync files between both versions

## Data Migration

### Migrating Existing Projects

#### From Desktop to SaaS

1. **Register SaaS Account**
   ```
   Visit your SaaS instance
   Register new account
   Verify email (if configured)
   ```

2. **Export Projects from Desktop**
   ```
   Save all project files (.stl, .obj, etc.)
   Organize by project
   Note any custom settings
   ```

3. **Upload to SaaS**
   ```
   Login to SaaS instance
   Use upload interface
   Import each project
   Verify settings
   ```

#### Automated Migration Script (Coming Soon)

A migration tool is planned that will:
- Export desktop projects automatically
- Upload to SaaS via API
- Preserve metadata and settings
- Verify successful migration

## Configuration Changes

### Desktop Configuration
Desktop app uses local configuration files:
- `config.json` (local settings)
- Local file system storage
- No authentication required

### SaaS Configuration
SaaS uses environment variables:
- `.env` file (server settings)
- Database for user data
- Cloud storage for files
- Authentication required

### Mapping Desktop Settings to SaaS

| Desktop Setting | SaaS Equivalent | Location |
|----------------|-----------------|----------|
| Upload Directory | UPLOAD_FOLDER | `.env` |
| Max File Size | MAX_CONTENT_LENGTH | `.env` |
| Printer Profiles | Database/API | Backend |
| User Preferences | User Account | Database |

## API Migration

### New API Endpoints

The SaaS version adds authentication endpoints:

```bash
# Register
POST /api/auth/register
{
  "username": "user",
  "email": "user@example.com",
  "password": "secure-password"
}

# Login
POST /api/auth/login
{
  "username": "user",
  "password": "secure-password"
}

# Use API with token
GET /api/convert
Headers:
  Authorization: Bearer <access_token>
```

### Desktop API Compatibility

Existing desktop API endpoints remain compatible:
- `/api/convert` - Convert file format
- `/api/scale` - Scale model
- `/api/separate` - Separate parts
- `/api/generate-sprue` - Generate sprue

**Note**: SaaS endpoints require authentication.

## Security Considerations

### Desktop Security
- Local files only
- No network exposure
- OS-level security

### SaaS Security
- HTTPS/TLS encryption
- User authentication
- API rate limiting
- Regular security updates
- Data encryption at rest
- Audit logging

### Best Practices
1. Use strong passwords
2. Enable 2FA (when available)
3. Rotate API keys regularly
4. Keep software updated
5. Use HTTPS only
6. Review access logs

## Rollback Plan

If you need to revert to desktop version:

1. **Keep Desktop App Installed**
   - Don't uninstall until SaaS is proven
   - Maintain local backups

2. **Export Data from SaaS**
   ```bash
   # Download all files via API
   curl -H "Authorization: Bearer $TOKEN" \
     https://your-instance/api/files/download-all
   ```

3. **Re-import to Desktop**
   - Copy files to desktop upload directory
   - Restore settings manually

## Troubleshooting

### Common Migration Issues

#### Issue: Can't access SaaS instance
**Solution**: Check network connectivity, firewall rules, and DNS configuration

#### Issue: Login fails
**Solution**: Verify credentials, check email verification, contact admin

#### Issue: Files won't upload
**Solution**: Check file size limits, network bandwidth, and storage quota

#### Issue: Missing features
**Solution**: Some features may be in development - check roadmap

### Getting Help

- **Documentation**: `docs/` directory
- **GitHub Issues**: https://github.com/mllinman/SprueCrafter/issues
- **Community**: Join discussions
- **Support**: Contact support team

## Post-Migration Checklist

- [ ] SaaS instance is accessible
- [ ] User account created and verified
- [ ] All project files uploaded
- [ ] Settings configured correctly
- [ ] Test all core features
- [ ] Verify file processing works
- [ ] Check printer profiles loaded
- [ ] Test authentication
- [ ] Backup data configured
- [ ] Document any issues

## Future Enhancements

### Planned Migration Features
- One-click desktop export
- Automatic cloud sync
- Batch file upload
- Settings migration tool
- Project templates
- Collaboration features
- Mobile app support

## Cost Comparison

### Desktop Version
- **Cost**: Free (one-time setup)
- **Storage**: Local disk space
- **Compute**: Local CPU/GPU
- **Maintenance**: User responsibility

### SaaS Version
- **Cost**: Subscription-based (Free tier available)
- **Storage**: Cloud storage (scalable)
- **Compute**: Cloud resources (scalable)
- **Maintenance**: Managed service

### Pricing Tiers (Example)

#### Free Tier
- 1 GB storage
- Basic features
- 10 conversions/month
- Community support

#### Pro Tier ($9.99/month)
- 50 GB storage
- All features
- Unlimited conversions
- Priority support
- API access

#### Enterprise Tier (Custom)
- Unlimited storage
- Custom features
- Dedicated resources
- SLA guarantee
- Custom integrations

## Conclusion

Migrating to SaaS provides many benefits while maintaining all the features you love. The transition can be gradual, allowing you to test and validate before fully committing.

For questions or assistance, please:
- Review documentation in `docs/`
- Open an issue on GitHub
- Contact support team

---

**SprueCrafter** - Now available as SaaS!
