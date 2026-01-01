# Development Guide

Welcome to SprueCrafter development! This guide will help you set up your development environment and contribute effectively.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Code Quality](#code-quality)
- [Testing](#testing)
- [Building](#building)
- [Debugging](#debugging)
- [Contributing](#contributing)

## Prerequisites

### Required Software

1. **Node.js v20.19.6 or higher**
   - Download: https://nodejs.org/
   - Verify: `node --version`
   - We recommend using [nvm](https://github.com/nvm-sh/nvm) for Node version management
   - The project includes a `.nvmrc` file: `nvm use`

2. **Python 3.9 or higher**
   - Download: https://www.python.org/
   - Verify: `python --version` or `python3 --version`
   - We recommend Python 3.12 for best compatibility

3. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

### Recommended Tools

- **VS Code** with extensions:
  - Python
  - ESLint
  - Prettier
  - EditorConfig
  - GitLens
- **Docker** (for SaaS development)
- **Postman** or **Insomnia** (for API testing)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mllinman/SprueCrafter.git
cd SprueCrafter
```

### 2. Set Up Node.js Environment

```bash
# If using nvm
nvm use

# Install Node dependencies
npm install
```

### 3. Set Up Python Environment

It's recommended to use a virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt
```

### 4. Verify Installation

```bash
# Run installation test
python test_installation.py
```

This will check that all dependencies are properly installed.

## Development Workflow

### Running the Application

#### Desktop Mode (Electron)

Start both backend and frontend in development mode:

```bash
npm run dev
```

This starts:
- Python Flask backend on http://localhost:5000
- Electron desktop application

Or run them separately:

```bash
# Terminal 1: Backend
npm run dev:backend
# or directly:
python src/backend/app.py

# Terminal 2: Electron
npm run dev:electron
```

#### Web Mode (SaaS)

```bash
npm run dev:web
# or directly:
python src/backend/app_web.py
```

Access at http://localhost:5000

### Project Structure

```
SprueCrafter/
├── src/
│   ├── backend/          # Python Flask backend
│   │   ├── app.py        # Main desktop API
│   │   ├── app_web.py    # Web/SaaS API
│   │   ├── app_saas.py   # SaaS features
│   │   └── core/         # Core processing modules
│   └── electron/         # Electron desktop app
│       └── main.js       # Electron main process
├── public/               # Web assets
├── docs/                 # Documentation
├── tests/                # Test files
├── requirements.txt      # Python dependencies
├── requirements-dev.txt  # Python dev dependencies
├── package.json          # Node.js configuration
└── pyproject.toml        # Python tools configuration
```

## Code Quality

### Python Code Standards

We use several tools to maintain code quality:

#### Black (Code Formatting)

```bash
# Format all Python files
black src/backend/

# Check without modifying
black --check src/backend/
```

#### isort (Import Sorting)

```bash
# Sort imports
isort src/backend/

# Check without modifying
isort --check src/backend/
```

#### Pylint (Linting)

```bash
# Lint Python code
pylint src/backend/

# Lint specific file
pylint src/backend/app.py
```

#### Type Checking with mypy

```bash
# Check types
mypy src/backend/
```

### JavaScript Code Standards

#### ESLint

```bash
# Lint JavaScript files
npm run lint

# Auto-fix issues
npm run lint:fix
```

#### Prettier

```bash
# Format JavaScript files
npm run format

# Check formatting
npm run format:check
```

### Running All Quality Checks

```bash
# Python
black src/backend/ && isort src/backend/ && pylint src/backend/

# JavaScript
npm run lint:fix && npm run format
```

## Testing

### Running Tests

#### Python Backend Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src/backend

# Run specific test file
pytest tests/test_file_converter.py

# Run with verbose output
pytest -v
```

#### Installation Test

```bash
# Interactive mode
python test_installation.py

# Non-interactive mode (CI)
python test_installation.py --non-interactive
```

### Writing Tests

Place test files in the `tests/` directory:

```python
# tests/test_example.py
import pytest
from src.backend.core.file_converter import FileConverter

def test_file_converter():
    converter = FileConverter()
    # Your test code here
    assert converter is not None
```

### Test Coverage

```bash
# Generate coverage report
pytest --cov=src/backend --cov-report=html

# Open coverage report
# Windows: start htmlcov/index.html
# macOS: open htmlcov/index.html
# Linux: xdg-open htmlcov/index.html
```

## Building

### Development Builds

For testing the built application:

```bash
npm run build
```

### Platform-Specific Builds

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

Built applications will be in the `dist/` directory.

## Debugging

### Backend Debugging

#### Using Python Debugger

Add breakpoints in your code:

```python
import pdb; pdb.set_trace()
```

Or use VS Code's built-in debugger with this launch configuration (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Flask Backend",
      "type": "python",
      "request": "launch",
      "module": "flask",
      "env": {
        "FLASK_APP": "src/backend/app.py",
        "FLASK_DEBUG": "1"
      },
      "args": ["run", "--host=127.0.0.1", "--port=5000"],
      "jinja": true
    }
  ]
}
```

#### Logging

The backend uses Python's logging module. Increase verbosity:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Frontend Debugging

#### Electron DevTools

Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (macOS) to open DevTools.

#### Console Logging

```javascript
console.log('Debug message');
console.error('Error message');
```

### API Testing

Use curl, Postman, or Insomnia to test API endpoints:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test with file upload
curl -X POST http://localhost:5000/api/convert \
  -F "file=@test_model.stl" \
  -F "format=obj" \
  --output converted.obj
```

## Contributing

### Before Committing

1. **Run code quality checks:**
   ```bash
   # Python
   black src/backend/
   isort src/backend/
   pylint src/backend/
   
   # JavaScript
   npm run lint:fix
   npm run format
   ```

2. **Run tests:**
   ```bash
   pytest
   npm test
   ```

3. **Update documentation** if you changed APIs or added features

### Git Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

3. **Push to GitHub:**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub

### Code Review Guidelines

- Write clear, descriptive commit messages
- Keep changes focused and atomic
- Add tests for new features
- Update documentation
- Ensure all CI checks pass

## Common Issues

### Python Import Errors

If you get import errors, ensure you're in the virtual environment:

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

### Port Already in Use

If port 5000 is in use:

```bash
# Find process using port 5000
# macOS/Linux:
lsof -i :5000
# Windows:
netstat -ano | findstr :5000

# Kill the process or change the port in app.py
```

### Electron Build Issues

Clear cache and rebuild:

```bash
rm -rf node_modules dist
npm install
npm run build
```

### Module Not Found Errors

Reinstall dependencies:

```bash
# Python
pip install -r requirements.txt -r requirements-dev.txt

# Node.js
npm install
```

## Performance Tips

### For Large Models

1. **Increase memory limit** in app.py if needed
2. **Use progress indicators** for long operations
3. **Process in chunks** for very large files
4. **Clear temp files** regularly

### Development Mode

- Flask debug mode is slower but provides better error messages
- Use `--reload` for automatic restart on code changes
- Disable debug mode for performance testing

## Additional Resources

- [API Documentation](API_DOCUMENTATION.md)
- [Security Policy](SECURITY.md)
- [Changelog](CHANGELOG.md)
- [Future Improvements](FUTURE_IMPROVEMENTS.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## Getting Help

- **Issues:** Open an issue on GitHub
- **Discussions:** Use GitHub Discussions for questions
- **Documentation:** Check existing docs first
- **Community:** Join our community channels

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev              # Start development mode
npm run dev:backend      # Start backend only
npm run dev:electron     # Start Electron only

# Code Quality
npm run lint            # Lint JavaScript
npm run format          # Format JavaScript
black src/backend/      # Format Python
pylint src/backend/     # Lint Python

# Testing
pytest                  # Run Python tests
npm test               # Run all tests

# Building
npm run build          # Build for all platforms
npm run build:win      # Build for Windows
npm run build:mac      # Build for macOS
npm run build:linux    # Build for Linux
```

---

**Happy Coding!** 🚀

If you have questions or run into issues, don't hesitate to ask for help.
