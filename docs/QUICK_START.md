# SprueCrafter Quick Start Guide

Get up and running with SprueCrafter in 5 minutes!

## Installation

### Prerequisites
- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/downloads))

### Quick Install

#### Windows
1. Open Command Prompt
2. Navigate to SprueCrafter directory
3. Run: `setup.bat`
4. Wait for dependencies to install

#### Mac/Linux
1. Open Terminal
2. Navigate to SprueCrafter directory
3. Run: `./setup.sh`
4. Wait for dependencies to install

### Manual Install (if setup script fails)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install
```

## First Launch

### Start the Application

```bash
npm start
```

The application window will open with a dark, modern interface.

## Your First Model

### Step 1: Import a 3D Model

1. Click the **Import** tab (first icon in sidebar)
2. Drag and drop a 3D model file OR click to browse
3. Supported formats: STL, OBJ, FBX, 3DS, PLY, GLTF, GLB, DAE
4. File information will appear below

### Step 2: Scale to 1/35

1. Click the **Scale** tab (third icon)
2. Select "1/35 Scale (Default)"
3. Choose input unit (usually "Millimeters")
4. Click **Scale Model**
5. Save the scaled file

### Step 3: Generate Sprue

1. Click the **Sprue Gen** tab (fifth icon)
2. Select your printer from dropdown
   - Elegoo Mars 3
   - Anycubic Photon Mono 4K
   - Phrozen Sonic Mighty 4K
   - Creality Halot One
   - Or select "Custom" and enter dimensions
3. Click **Generate Sprue**
4. Save the sprue file
5. **Done!** Your model is ready to print!

## Common Tasks

### Convert File Format

Need to convert OBJ to STL?

1. Import your file
2. Click **Convert** tab
3. Select target format (usually STL)
4. Click **Convert File**
5. Save converted file

### Separate Parts

Want to organize parts into categories?

1. Import your model
2. Click **Separate** tab
3. Click **Separate Parts**
4. View parts organized by category:
   - Body
   - Turret
   - Weapons
   - Wheels
   - Details
   - Accessories

### Create Model from Photos

Have multiple photos of an object?

1. Click **Photo2Model** tab
2. Click **Select Photos**
3. Choose 10+ photos from different angles
4. Click **Generate 3D Model**
5. Wait for processing (may take several minutes)
6. Save the generated model

## Keyboard Shortcuts

- `Ctrl/Cmd + O` - Open file
- `Ctrl/Cmd + S` - Save file
- `Ctrl/Cmd + Q` - Quit

## Printer Profiles

SprueCrafter includes pre-configured profiles for popular resin printers:

| Printer | Build Volume (mm) |
|---------|------------------|
| Elegoo Mars 3 | 143.43 × 89.6 × 175 |
| Anycubic Photon Mono 4K | 132 × 80 × 165 |
| Phrozen Sonic Mighty 4K | 200 × 125 × 220 |
| Creality Halot One | 127 × 80 × 160 |

Don't see your printer? Select "Custom" and enter your build plate dimensions!

## Tips for Best Results

### For Models
- ✓ Clean, watertight meshes work best
- ✓ Remove non-manifold edges before importing
- ✓ Start with models under 100MB for fast processing

### For Photos
- ✓ Take 10-20 photos from different angles
- ✓ Use consistent lighting
- ✓ Overlap photos by 70-80%
- ✓ Avoid reflective surfaces

### For Printing
- ✓ Orient parts to minimize supports
- ✓ Check sprue fits your build plate
- ✓ Test print small sections first
- ✓ Use recommended resin settings

## Troubleshooting

### Backend Won't Start
**Problem**: Red dot in bottom-right corner

**Solution**: Backend isn't running
1. Open Terminal/Command Prompt
2. Navigate to project folder
3. Run: `python src/backend/app.py`
4. Keep terminal open
5. Restart SprueCrafter

### File Won't Load
**Problem**: Error loading 3D file

**Solutions**:
- Try converting to STL in another program first
- Check file isn't corrupted
- Reduce polygon count if very large

### Out of Memory
**Problem**: Application crashes with large files

**Solutions**:
- Close other applications
- Reduce model polygon count
- Process parts separately
- Split large models manually

## Next Steps

### Learn More
- Read the [User Guide](USER_GUIDE.md) for detailed workflows
- Check the [API Documentation](API.md) for programmatic access
- Explore [Examples](../examples/README.md) for code samples

### Get Help
- Check documentation in `docs/` folder
- Open an issue on GitHub
- Review example scripts in `examples/`

## Quick Reference

### Standard Scales
- 1/35 - Armor models (tanks, AFVs)
- 1/48 - Aircraft, some armor
- 1/72 - Aircraft, ships, small armor
- 1/144 - Aircraft, ships
- Custom - Any scale you need

### File Formats
**Input**: STL, OBJ, FBX, 3DS, PLY, GLTF, GLB, DAE, STEP, IGES
**Output**: STL (recommended for printing), OBJ, PLY, GLTF, GLB

### Sprue Parameters
- Runner diameter: 2.0mm
- Gate diameter: 1.0mm
- Part spacing: 5.0mm minimum
- Border margin: 5.0mm
- Gate height: 2.0mm

## That's It!

You're ready to create professional model sprues! 

Start with a simple model to get familiar with the workflow, then move on to more complex projects.

Happy modeling! 🎨🖨️
