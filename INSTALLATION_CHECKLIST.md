# SprueCrafter Installation Checklist

Use this checklist to verify your SprueCrafter installation is complete and working.

## Prerequisites ✅

- [ ] Python 3.8 or higher installed
  ```bash
  python3 --version
  ```

- [ ] Node.js 16 or higher installed
  ```bash
  node --version
  ```

- [ ] Git installed (for cloning)
  ```bash
  git --version
  ```

## Installation Steps ✅

- [ ] Repository cloned
  ```bash
  git clone https://github.com/mllinman/SprueCrafter.git
  cd SprueCrafter
  ```

- [ ] Python dependencies installed
  ```bash
  pip3 install -r requirements.txt
  ```

- [ ] Node.js dependencies installed
  ```bash
  npm install
  ```

## Verification ✅

### Automated Test
- [ ] Run installation test script
  ```bash
  python3 test_installation.py --non-interactive
  ```
  Expected: All tests pass ✅

### Manual Verification

#### Backend API
- [ ] Start backend server
  ```bash
  python src/backend/app.py
  ```

- [ ] Test health endpoint in another terminal
  ```bash
  curl http://127.0.0.1:5000/api/health
  ```
  Expected: `{"status": "ok", "message": "SprueCrafter API is running"}`

- [ ] Test printer profiles
  ```bash
  curl http://127.0.0.1:5000/api/printer-profiles
  ```
  Expected: JSON with 8 printer profiles

#### Desktop Application
- [ ] Start desktop app (with backend running)
  ```bash
  npm start
  ```
  Expected: Electron window opens with dark UI

- [ ] Click through all tabs
  - [ ] Import
  - [ ] Convert
  - [ ] Scale
  - [ ] Separate
  - [ ] Transform
  - [ ] Supports
  - [ ] Sprue Gen
  - [ ] Photo2Model
  - [ ] 3D Viewer

#### Workflow Test
- [ ] Run example workflow (with backend running)
  ```bash
  python3 examples/workflow_example.py
  ```
  Expected: Creates sample model, scales, separates, generates sprue ✅

## Feature Tests ✅

Test each major feature manually:

### File Conversion
- [ ] Import a 3D model (drag & drop or click)
- [ ] Convert to different format (STL → OBJ)
- [ ] Save converted file
- [ ] Verify file is valid

### Scaling
- [ ] Import a model
- [ ] Select 1/35 scale
- [ ] Scale the model
- [ ] Verify size is correct (original × 0.02857)

### Part Separation
- [ ] Import a multi-part model
- [ ] Click "Separate Parts"
- [ ] Verify parts are categorized
- [ ] Check part count matches expected

### Sprue Generation
- [ ] Import/scale a model
- [ ] Select printer profile (e.g., Elegoo Saturn)
- [ ] Choose connector type (e.g., cylindrical)
- [ ] Generate sprue
- [ ] Save sprue file
- [ ] Verify sprue file contains model + runners

## Common Issues ❓

### Backend won't start
- [ ] Check Python version (must be 3.8+)
- [ ] Reinstall Python dependencies
- [ ] Check port 5000 is not in use
  ```bash
  lsof -i :5000  # macOS/Linux
  netstat -ano | findstr :5000  # Windows
  ```

### Desktop app won't start
- [ ] Check Node.js version (must be 16+)
- [ ] Reinstall Node dependencies
- [ ] Check Electron installed correctly
  ```bash
  npm list electron
  ```

### File conversion fails
- [ ] Check file format is supported
- [ ] Try converting to STL first
- [ ] Reduce polygon count if very large
- [ ] Check file is not corrupted

### Out of memory
- [ ] Close other applications
- [ ] Reduce model complexity
- [ ] Process smaller models
- [ ] Increase system memory

## Documentation ✅

Verify you can access documentation:

- [ ] Main README.md
- [ ] docs/QUICK_START.md
- [ ] docs/USER_GUIDE.md
- [ ] docs/API.md
- [ ] TEST_MVP.md
- [ ] QUICKSTART.md
- [ ] examples/README.md

## Support ✅

If you encounter issues:

1. [ ] Check documentation in `docs/` folder
2. [ ] Run automated test: `python3 test_installation.py`
3. [ ] Check example scripts in `examples/` folder
4. [ ] Review TEST_MVP.md for known issues
5. [ ] Open an issue on GitHub with:
   - Python version
   - Node.js version
   - Operating system
   - Error messages
   - Steps to reproduce

## Success! 🎉

If all checkboxes above are checked, your SprueCrafter installation is complete and working!

You're ready to:
- Convert 3D models to multiple formats
- Scale models to 1/35 or custom scales
- Separate parts automatically
- Generate professional sprues
- Create support structures
- Print on your resin printer!

**Happy modeling!** 🎨🖨️

---

For detailed usage instructions, see [QUICKSTART.md](QUICKSTART.md) or [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
