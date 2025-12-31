# SprueCrafter MVP - Quick Start

## What is SprueCrafter?

SprueCrafter is a professional 3D model to sprue conversion tool for resin printing that converts 3D models into 1/35th scale model sprues, rivaling industry-standard quality from manufacturers like Meng and Takom.

## Features

✅ **3D File Conversion** - Supports STL, OBJ, FBX, 3DS, PLY, GLTF, GLB, DAE, and more
✅ **Scale Conversion** - Automatic scaling to 1/35th (or any custom scale)
✅ **Part Separation** - AI-powered automatic part categorization
✅ **Sprue Generation** - Professional-quality sprue layouts with multiple connector types
✅ **Support Generation** - Automatic support structure creation
✅ **Photo to 3D** - Convert photographs to 3D models
✅ **Modern UI** - Beautiful dark theme with 3D workspace
✅ **Printer Profiles** - Pre-configured for 7 popular resin printers

## Quick Installation

### Prerequisites
- Python 3.8+ ([Download](https://www.python.org/downloads/))
- Node.js 16+ ([Download](https://nodejs.org/))

### Install in 3 Steps

```bash
# 1. Clone the repository
git clone https://github.com/mllinman/SprueCrafter.git
cd SprueCrafter

# 2. Install dependencies
pip3 install -r requirements.txt
npm install

# 3. Start the application
npm start
```

Or use the setup script:
```bash
./setup.sh          # Mac/Linux
setup.bat           # Windows
```

## Verify Installation

Run the test script to verify everything is working:

```bash
python3 test_installation.py
```

This will:
- ✅ Check all dependencies
- ✅ Test core modules
- ✅ Verify API endpoints
- ✅ Create a test model
- ✅ Test file conversion
- ✅ Test scaling
- ✅ Test sprue generation

## Basic Usage

### 1. Start Backend (if not auto-started)
```bash
python src/backend/app.py
```

### 2. Launch Desktop App
```bash
npm start
```

### 3. Process Your First Model

**Using the Desktop App:**
1. Click **Import** tab
2. Drag and drop your 3D model
3. Click **Scale** tab → Select 1/35 scale → Click "Scale Model"
4. Click **Sprue Gen** tab → Select your printer → Click "Generate Sprue"
5. Save your sprue file → Ready to print! 🎉

**Using the API:**
```python
import requests

# Convert file
with open('model.obj', 'rb') as f:
    response = requests.post('http://127.0.0.1:5000/api/convert',
                           files={'file': f},
                           data={'format': 'stl'})
    with open('model.stl', 'wb') as out:
        out.write(response.content)

# Scale to 1/35
with open('model.stl', 'rb') as f:
    response = requests.post('http://127.0.0.1:5000/api/scale',
                           files={'file': f},
                           data={'scale': 0.02857, 'unit': 'mm'})
    with open('model_scaled.stl', 'wb') as out:
        out.write(response.content)

# Generate sprue
with open('model_scaled.stl', 'rb') as f:
    response = requests.post('http://127.0.0.1:5000/api/generate-sprue',
                           files={'file': f},
                           data={
                               'build_plate_x': 192,
                               'build_plate_y': 120,
                               'build_plate_z': 245,
                               'connector_type': 'cylindrical'
                           })
    with open('model_sprue.stl', 'wb') as out:
        out.write(response.content)
```

## Supported Printers

Pre-configured profiles included:
- Elegoo Mars 3 (143.43 × 89.6 × 175mm)
- Elegoo Saturn (192 × 120 × 200mm)
- Elegoo Saturn 2 (218.88 × 122.88 × 250mm)
- Elegoo Jupiter (277.85 × 156.10 × 300mm)
- Anycubic Photon Mono 4K (132 × 80 × 165mm)
- Phrozen Sonic Mighty 4K (200 × 125 × 220mm)
- Creality Halot One (127 × 80 × 160mm)
- Custom (enter your own dimensions)

## Documentation

📖 **Full Documentation:** See [docs/](docs/) folder
- [README.md](README.md) - Comprehensive overview
- [QUICK_START.md](docs/QUICK_START.md) - Detailed getting started
- [USER_GUIDE.md](docs/USER_GUIDE.md) - Complete user manual
- [API.md](docs/API.md) - API reference
- [TEST_MVP.md](TEST_MVP.md) - Test results and MVP status

## Troubleshooting

### Backend won't start?
```bash
# Check if Python dependencies are installed
pip3 list | grep -E "(trimesh|flask|numpy)"

# Reinstall if needed
pip3 install -r requirements.txt
```

### File won't load?
- Try converting to STL first in another program
- Reduce polygon count if very large
- Ensure the mesh is watertight

### Out of memory?
- Close other applications
- Reduce model polygon count
- Process parts separately

## Support

- 📧 Open an issue on GitHub
- 📖 Check [docs/](docs/) for detailed guides
- 💡 See [examples/](examples/) for code samples

## License

MIT License - See [LICENSE](LICENSE) file

---

**Ready to create professional model sprues!** 🎨🖨️

For more information, see [README.md](README.md)
