# Contributing to SprueCrafter

Thank you for your interest in contributing to SprueCrafter! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Git

### Clone and Setup
```bash
git clone https://github.com/mllinman/SprueCrafter.git
cd SprueCrafter
./setup.sh  # or setup.bat on Windows
```

### Development Mode
```bash
npm run dev
```

This starts both the backend and Electron in development mode with hot reload.

## Project Architecture

### Backend (Python/Flask)
- **Location**: `src/backend/`
- **Framework**: Flask
- **Purpose**: 3D processing engine and API

### Frontend (Electron)
- **Location**: `src/electron/`
- **Framework**: Electron + Vanilla JS
- **Purpose**: Desktop UI

### Core Modules
- `file_converter.py` - Format conversion
- `scale_converter.py` - Model scaling
- `part_separator.py` - Part separation
- `sprue_generator.py` - Sprue generation
- `photo_to_model.py` - Photogrammetry

## Code Style

### Python
- Follow PEP 8 style guide
- Use meaningful variable names
- Add docstrings to functions and classes
- Keep functions focused and single-purpose

```python
def convert_file(input_path, target_format):
    """
    Convert 3D file to target format
    
    Args:
        input_path: Path to input file
        target_format: Target format (e.g., 'stl')
    
    Returns:
        Path to converted file
    """
    # Implementation
```

### JavaScript
- Use ES6+ features
- Use const/let instead of var
- Add JSDoc comments for functions
- Use meaningful variable names

```javascript
/**
 * Convert file format
 * @param {File} file - Input file
 * @param {string} format - Target format
 * @returns {Promise<Blob>} Converted file
 */
async function convertFile(file, format) {
    // Implementation
}
```

### CSS
- Use CSS variables for theming
- Follow BEM naming convention when appropriate
- Keep selectors specific but not overly complex
- Group related styles together

## Adding Features

### Adding a New 3D Processing Function

1. **Create module** in `src/backend/core/`
2. **Add API endpoint** in `src/backend/app.py`
3. **Add UI controls** in `src/electron/index.html`
4. **Add logic** in `src/electron/renderer.js`
5. **Update documentation**

Example - Adding mesh repair:

```python
# src/backend/core/mesh_repair.py
class MeshRepairer:
    def repair(self, mesh_path):
        """Repair mesh issues"""
        # Implementation
```

```python
# src/backend/app.py
@app.route('/api/repair', methods=['POST'])
def repair_mesh():
    # Endpoint implementation
```

```html
<!-- src/electron/index.html -->
<button class="btn-primary" id="repair-btn">Repair Mesh</button>
```

### Adding a Printer Profile

Edit `src/backend/app.py`:

```python
@app.route('/api/printer-profiles', methods=['GET'])
def get_printer_profiles():
    profiles = {
        # ... existing profiles ...
        'new_printer': {
            'name': 'New Printer Model',
            'build_volume': {'x': 150, 'y': 100, 'z': 200}
        }
    }
    return jsonify(profiles)
```

### Adding a New Tab

1. Add navigation button in sidebar
2. Create tab content section
3. Add initialization function
4. Wire up event handlers

## Testing

### Running Backend Tests
```bash
python -m pytest src/backend/tests/
```

### Manual Testing Checklist
- [ ] Import various file formats
- [ ] Scale models to different scales
- [ ] Separate complex models
- [ ] Generate sprues for different printers
- [ ] Test photo-to-model conversion
- [ ] Check UI responsiveness
- [ ] Verify error handling

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Make** your changes
4. **Test** thoroughly
5. **Commit** with clear messages
   ```bash
   git commit -m "Add feature: description"
   ```
6. **Push** to your fork
   ```bash
   git push origin feature/my-feature
   ```
7. **Create** Pull Request on GitHub

### PR Guidelines
- Clear title and description
- Reference related issues
- Include screenshots for UI changes
- Update documentation if needed
- Ensure all tests pass
- Keep changes focused

## Bug Reports

When reporting bugs, include:
- SprueCrafter version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages
- Sample files (if applicable)

### Good Bug Report Example
```
**Version**: 1.0.0
**OS**: Windows 10

**Steps to Reproduce**:
1. Import large OBJ file (>100MB)
2. Click "Separate Parts"
3. Application crashes

**Expected**: Parts should be separated
**Actual**: Application crashes with out of memory error

**Error**: MemoryError: Unable to allocate array
```

## Feature Requests

When suggesting features:
- Describe the use case
- Explain the benefit
- Provide examples if possible
- Consider implementation complexity

## Code Review

All contributions will be reviewed for:
- Code quality and style
- Functionality and correctness
- Performance considerations
- Security implications
- Documentation completeness

## Documentation

When adding features, update:
- `README.md` - If changing core functionality
- `docs/USER_GUIDE.md` - For user-facing features
- `docs/API.md` - For API changes
- Inline code comments - Always
- Example scripts - If applicable

## Community Guidelines

- Be respectful and professional
- Help others learn and grow
- Provide constructive feedback
- Stay on topic
- Follow the code of conduct

## Getting Help

- Check existing documentation
- Search closed issues
- Ask in discussions
- Open an issue for bugs
- Tag maintainers if urgent

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Mentioned in relevant documentation

## Areas for Contribution

Looking for where to help? Consider:

### High Priority
- Additional 3D file format support
- Enhanced photogrammetry algorithms
- Advanced mesh repair tools
- Performance optimizations
- Test coverage

### Medium Priority
- UI/UX improvements
- Additional printer profiles
- Export format options
- Batch processing
- Keyboard shortcuts

### Nice to Have
- Cloud processing integration
- Model marketplace
- Advanced texturing
- Animation support
- VR preview

## Development Tools

### Recommended Tools
- **IDE**: VS Code, PyCharm, or similar
- **3D Viewer**: Blender, MeshLab
- **API Testing**: Postman, curl
- **Debugging**: Chrome DevTools (for Electron)

### Useful Extensions (VS Code)
- Python
- ESLint
- Prettier
- GitLens
- Material Icon Theme

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Run full test suite
4. Build for all platforms
5. Create release notes
6. Tag release
7. Publish to GitHub

## Questions?

Don't hesitate to ask questions! Open an issue or discussion if anything is unclear.

Thank you for contributing to SprueCrafter! 🎉
