# Security Notes for Railway Deployment

This document tracks security considerations for the SprueCrafter SaaS deployment.

## Pre-existing Security Issues (Not Fixed in This PR)

The following security issues exist in the codebase prior to this Railway deployment PR. These should be addressed in future updates:

### 1. Hardcoded Admin Credentials in Client Code
**File**: `src/web/renderer.js`, lines 948-953  
**Issue**: Admin credentials are hardcoded in client-side JavaScript, visible to anyone who views the source.  
**Risk**: High - Anyone can log in as admin  
**Recommendation**: 
- Remove hardcoded credentials entirely
- Implement proper backend authentication
- Use JWT tokens or session-based auth
- Store credentials securely on backend only

### 2. Browser Prompt() Usage for User Input
**File**: `src/web/renderer.js`, lines 1306, 1314, 1336  
**Issue**: Using browser `prompt()` for user input provides poor UX and can be confusing  
**Risk**: Low - UX issue, not a security risk  
**Recommendation**: Replace with proper modal dialogs (already noted in code comments)

## Railway Deployment Security Recommendations

### Environment Variables
Always set these securely in Railway dashboard (never in code):
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `PRO_USERS` - Pre-configured Pro user credentials

### CORS Configuration
The current CORS configuration allows:
- Specific localhost ports (3000, 5000, 8080, 8081) for development
- Railway domains (*.railway.app, *.up.railway.app) for production

For production with custom domains:
1. Add your custom domain to the CORS origins list in `src/backend/app.py`
2. Remove localhost origins if not needed for development

### File Upload Security
Current implementation:
- 500MB max file size (configurable)
- Temporary file storage (automatically cleaned by OS)
- File type validation based on extension

Recommendations for production:
- Implement virus scanning for uploaded files
- Add rate limiting for file uploads
- Consider using object storage (S3) instead of temp files
- Implement user quotas for file storage

### Rate Limiting
Currently not implemented. Recommendations:
- Add Flask-Limiter for API rate limiting
- Limit file uploads per IP/user
- Limit API calls per IP/user
- Different limits for free vs Pro users

### Authentication
Current state:
- No authentication required for basic features (by design)
- Pro features use API key in X-API-Key header
- Admin login uses hardcoded credentials (ISSUE - see above)

Recommendations for multi-user deployment:
- Implement proper user authentication (OAuth, JWT)
- Add user accounts and sessions
- Secure admin interface
- Add role-based access control (RBAC)

### HTTPS
Railway automatically provides HTTPS for all deployments. Ensure:
- All Stripe URLs use HTTPS
- All external API calls use HTTPS
- No mixed content warnings

### Database Security (Future)
If adding database in the future:
- Use Railway's PostgreSQL service
- Store connection string in environment variables
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data at rest

### Monitoring
Recommendations:
- Monitor Railway logs for suspicious activity
- Set up alerts for errors and unusual patterns
- Track API usage and file upload patterns
- Monitor for abuse and excessive resource usage

## Security Checklist for Production Deployment

Before going live with paying customers:

- [ ] Remove or properly secure hardcoded admin credentials
- [ ] Implement proper user authentication system
- [ ] Add rate limiting to all API endpoints
- [ ] Set up virus scanning for file uploads
- [ ] Implement user quotas and resource limits
- [ ] Add monitoring and alerting
- [ ] Review and update CORS origins for production domains
- [ ] Enable HTTPS only (Railway does this automatically)
- [ ] Set up Stripe webhook endpoint verification
- [ ] Review all environment variables
- [ ] Implement logging for security events
- [ ] Add CSRF protection for form submissions
- [ ] Consider adding WAF (Web Application Firewall)
- [ ] Perform security audit/penetration testing

## Incident Response

If security issue is discovered:
1. Review Railway logs to assess impact
2. Rotate any compromised credentials immediately
3. Update code to fix vulnerability
4. Deploy fix to Railway (auto-deploys from GitHub)
5. Notify affected users if data was compromised
6. Document incident and prevention steps

## Contact

For security issues, please report privately to the repository maintainers before public disclosure.

---

**Note**: This is a work-in-progress document. Update as security measures are implemented.
