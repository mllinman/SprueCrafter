# Security Policy

## Supported Versions

We actively support the following versions of SprueCrafter with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of SprueCrafter seriously. If you discover a security vulnerability, please follow these steps:

1. **Do Not** open a public issue on GitHub
2. Email the details to the maintainers (create a private security advisory on GitHub)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We'll acknowledge your report within 48 hours
- **Updates**: We'll keep you informed about our progress
- **Timeline**: We aim to release a fix within 30 days for critical issues
- **Credit**: We'll credit you in the release notes (unless you prefer to remain anonymous)

## Security Best Practices

### For Users

1. **Keep Dependencies Updated**: Regularly update to the latest version
2. **Use HTTPS**: Always use HTTPS for web deployments
3. **Secure API Keys**: Never commit API keys or secrets to version control
4. **Environment Variables**: Use `.env` files for sensitive configuration
5. **Validate Inputs**: Be cautious with untrusted 3D model files

### For SaaS Deployments

1. **Database Security**: 
   - Use strong passwords
   - Enable SSL/TLS for database connections
   - Regularly backup data

2. **API Security**:
   - Enable rate limiting
   - Use JWT tokens with appropriate expiration
   - Implement CORS properly

3. **Infrastructure**:
   - Keep container images updated
   - Use secrets management (Kubernetes secrets, AWS Secrets Manager)
   - Enable monitoring and logging
   - Regular security audits

4. **File Upload Security**:
   - Validate file types and sizes
   - Scan uploaded files for malware
   - Use separate storage for user uploads
   - Implement upload quotas

## Known Security Considerations

### 3D File Processing

- Large or malformed 3D files may cause high memory usage or denial of service
- Implement file size limits (recommended: 100MB for desktop, 50MB for web)
- Use timeouts for long-running processing operations

### Python Dependencies

- We regularly update dependencies to patch security vulnerabilities
- Critical updates are documented in CHANGELOG.md

### Node.js Dependencies

- Electron applications should be kept up to date
- We use `npm audit` to check for vulnerabilities
- Dependencies are updated quarterly at minimum

## Dependency Security

### Automated Scanning

We use:
- GitHub Dependabot for dependency updates
- `npm audit` for Node.js packages
- `pip-audit` for Python packages
- CodeQL for code analysis

### Update Policy

- **Critical vulnerabilities**: Fixed within 7 days
- **High vulnerabilities**: Fixed within 30 days
- **Medium/Low vulnerabilities**: Fixed in next regular release

## Security Features

### Current Implementation

- ✅ HTTPS support for web deployments
- ✅ JWT-based authentication
- ✅ Rate limiting (Flask-Limiter)
- ✅ CORS configuration
- ✅ Input validation
- ✅ Secure file uploads
- ✅ Environment-based configuration

### Planned Enhancements

- 🔄 File upload virus scanning
- 🔄 Advanced input sanitization
- 🔄 Security headers (CSP, HSTS)
- 🔄 Two-factor authentication
- 🔄 Audit logging

## Compliance

### Data Protection

- User data is stored securely
- Passwords are hashed using industry-standard algorithms
- Personal data can be deleted upon request (GDPR compliance)

### Open Source Security

- Regular security audits
- Transparent vulnerability disclosure
- Community-driven security improvements

## Contact

For security-related questions or concerns:
- Create a private security advisory on GitHub
- Check existing security advisories first

## Acknowledgments

We thank the security researchers and community members who help keep SprueCrafter secure.

---

**Last Updated**: 2026-01-01  
**Version**: 1.0
