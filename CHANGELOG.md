# Changelog

All notable changes to SprueCrafter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- SECURITY.md file with comprehensive security policies and best practices
- CHANGELOG.md to track version changes
- Enhanced security scanning for dependencies

### Changed
- **BREAKING**: Minimum Node.js version requirement updated from v16 to v20
- **BREAKING**: Minimum Python version requirement updated from v3.8 to v3.9
- Updated Electron from v27.0.0 to v33.2.0 for improved security and performance
- Updated Three.js from v0.158.0 to v0.172.0 with new features and bug fixes
- Updated axios from v1.6.0 to v1.12.0 (fixes multiple security vulnerabilities)
- Updated electron-builder from v24.6.4 to v25.1.8
- Updated concurrently from v8.2.2 to v9.1.0

### Python Dependencies Updated
- numpy: 1.24.3 → 2.2.1 (major version bump, performance improvements)
- scipy: 1.11.3 → 1.15.1
- Flask: 3.0.0 → 3.1.0
- flask-cors: 4.0.0 → 5.0.0
- trimesh: 4.0.5 → 4.5.4
- opencv-python: 4.8.1.78 → 4.11.0.86
- Pillow: 10.1.0 → 11.1.0 (important security updates)
- scikit-image: 0.22.0 → 0.25.0
- shapely: 2.0.2 → 2.1.0
- tqdm: 4.66.1 → 4.67.1
- pyyaml: 6.0.1 → 6.0.2

### Production Dependencies Updated
- gunicorn: 21.2.0 → 23.0.0
- redis: 5.0.1 → 5.2.1
- flask-migrate: 4.0.5 → 4.0.7
- flask-jwt-extended: 4.5.3 → 4.7.1
- flask-limiter: 3.5.0 → 3.10.0
- boto3: 1.34.0 → 1.35.94
- sentry-sdk: 1.39.1 → 2.19.2
- stripe: 7.0.0 → 11.3.0 (major API improvements)
- python-dateutil: 2.8.2 → 2.9.0

### Security
- Fixed axios CVE-2024-XXXXX (DoS vulnerability through lack of data size check)
- Fixed axios CVE-2024-XXXXX (SSRF and credential leakage vulnerability)
- Updated Pillow with security patches for image processing vulnerabilities
- Updated all dependencies to versions without known security vulnerabilities

### Documentation
- Updated README.md with current version requirements
- Added download links for prerequisites
- Improved installation instructions clarity

## [1.0.0] - 2024-XX-XX

### Added
- Initial release of SprueCrafter
- 3D model to sprue conversion functionality
- Support for multiple 3D file formats (STL, OBJ, FBX, 3DS, PLY, GLTF, GLB, DAE)
- Intelligent part separation and categorization
- Professional sprue generation with multiple connector types
- Photo-to-3D conversion using photogrammetry
- Desktop application (Electron-based)
- Python Flask backend API
- SaaS deployment support with Docker and Kubernetes
- User authentication and JWT tokens
- Stripe integration for subscription payments
- Cloud storage support (S3-compatible)
- Printer profiles for popular resin printers
- Support generation tools
- Model transformation operations (rotate, translate, scale)
- 3D viewer with interactive controls
- Dark theme UI
- Documentation and deployment guides

### Supported Features
- Universal 3D file conversion
- Automatic scaling to 1/35th scale (and custom scales)
- Smart part separation
- AI-powered part categorization
- Professional sprue layouts
- Multiple connector types (cylindrical, pyramid, triangular, square, spherical)
- Build plate matching for various printers
- Real-time preview
- Database persistence (PostgreSQL)
- Horizontal scaling support
- Prometheus metrics
- Rate limiting
- CORS support

---

## Version History

### Versioning Strategy

We follow Semantic Versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes or significant new features
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes and minor improvements

### Support Timeline

- **Latest version**: Full support with features and security updates
- **Previous minor version**: Security updates only (6 months)
- **Older versions**: Unsupported (please upgrade)

---

## Migration Guides

### Upgrading from Pre-1.0 Versions

If upgrading from development versions:

1. **Update Node.js**: Ensure you have Node.js v20 or higher
2. **Update Python**: Ensure you have Python 3.9 or higher
3. **Reinstall Dependencies**:
   ```bash
   npm install
   pip install -r requirements.txt
   ```
4. **Database Migration** (SaaS deployments):
   ```bash
   flask db upgrade
   ```
5. **Update Environment Variables**: Check `.env.example` for new variables

### Breaking Changes in v1.0

- Node.js v16-v19 is no longer supported
- Python 3.8 is no longer supported
- Some API endpoints may have changed (see API documentation)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute to this changelog and the project.

## Links

- [Project Homepage](https://github.com/mllinman/SprueCrafter)
- [Issue Tracker](https://github.com/mllinman/SprueCrafter/issues)
- [Security Policy](SECURITY.md)
- [Documentation](README.md)

---

**Note**: Dates use ISO 8601 format (YYYY-MM-DD)
