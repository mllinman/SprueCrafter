# SprueCrafter

**Professional 3D Model to Sprue Conversion Tool for Resin Printing**

SprueCrafter is a powerful application that converts 3D object data into 1/35th scale model sprues optimized for resin 3D printing. It rivals industry-standard quality from manufacturers like Meng and Takom, while providing modern tools for automatic part separation, categorization, and sprue generation.

![SprueCrafter Banner](assets/banner.png)

## Features

### 🎯 Core Functionality

- **Universal 3D File Conversion**: Supports all major 3D formats (STL, OBJ, FBX, 3DS, PLY, GLTF, GLB, DAE, and more)
- **Intelligent Scale Conversion**: Automatic scaling to 1/35th scale (or any custom scale)
- **Smart Part Separation**: Automatically separates models into individual components
- **Intelligent Categorization**: AI-powered part categorization (body, turret, weapons, wheels, details, accessories)
- **Professional Sprue Generation**: Industry-quality sprue layouts with optimized runners and gates
- **Photo-to-3D Conversion**: Create 3D models from photographs using photogrammetry
- **Resin Printer Compatible**: Works with all mainstream resin printers

### 🎨 Modern UI

- **Dark Theme**: Beautiful, modern dark interface with bright accent colors
- **3D Workspace**: Interactive 3D viewer for model manipulation
- **Build Plate Matching**: Configure for your specific resin printer's build volume
- **Real-time Preview**: See changes in real-time before exporting
- **Intuitive Controls**: Easy-to-use drag-and-drop interface

### 🖨️ Printer Compatibility

Pre-configured profiles for popular resin printers:
- Elegoo Mars 3
- Anycubic Photon Mono 4K
- Phrozen Sonic Mighty 4K
- Creality Halot One
- Custom printer support

## Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git**

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/mllinman/SprueCrafter.git
   cd SprueCrafter
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Start the application**
   ```bash
   npm start
   ```

### Development Mode

To run in development mode with auto-reload:
```bash
npm run dev
```

## Usage Guide

### 1. Import 3D Model

- Click on the **Import** tab
- Drag and drop your 3D model file or click to browse
- Supported formats: STL, OBJ, FBX, 3DS, PLY, GLTF, GLB, DAE
- View file information after upload

### 2. Convert File Format

- Select **Convert** tab
- Choose target format from dropdown
- Click **Convert File** to export in new format

### 3. Scale Model

- Navigate to **Scale** tab
- Select scale (default: 1/35th)
  - 1/35 Scale (Armor models)
  - 1/48 Scale (Aircraft)
  - 1/72 Scale (Small scale)
  - 1/144 Scale (Micro scale)
  - Custom scale
- Choose input unit (mm, cm, in, m)
- Click **Scale Model** to apply

### 4. Separate Parts

- Go to **Separate** tab
- Click **Separate Parts**
- System automatically:
  - Splits model into components
  - Categorizes parts by type
  - Displays organized parts list

### 5. Generate Sprue

- Select **Sprue Gen** tab
- Choose printer profile or enter custom build plate dimensions
- Click **Generate Sprue**
- System creates:
  - Optimized part layout
  - Professional runner system
  - Connection gates
  - Ready-to-print sprue file

### 6. Photo to 3D Model

- Navigate to **Photo2Model** tab
- Click **Select Photos**
- Choose multiple photos (minimum 2, more is better)
- Click **Generate 3D Model**
- System processes photos and creates 3D mesh

### 7. 3D Viewer

- Use **3D Viewer** tab to:
  - Visualize models
  - Rotate, zoom, pan
  - Inspect details
  - Verify sprue layout

## Technical Details

### Architecture

SprueCrafter uses a hybrid architecture:

- **Frontend**: Electron + HTML/CSS/JavaScript
  - Modern, responsive UI
  - Real-time 3D visualization
  - File management

- **Backend**: Python Flask API
  - 3D processing engine
  - File format conversion
  - Mesh manipulation
  - Sprue generation algorithms

### 3D Processing Libraries

- **trimesh**: Core 3D mesh processing
- **numpy**: Numerical computations
- **scipy**: Scientific computing
- **pymeshlab**: Advanced mesh operations
- **open3d**: 3D data processing
- **opencv**: Image processing for photogrammetry

### Sprue Generation Algorithm

SprueCrafter uses advanced algorithms for professional sprue generation:

1. **Part Analysis**: Analyzes geometry and optimal orientation
2. **Bin Packing**: Efficiently arranges parts on build plate
3. **Runner Generation**: Creates main sprue runners
4. **Gate Creation**: Adds connection points to parts
5. **Optimization**: Minimizes support requirements
6. **Export**: Generates print-ready STL file

## API Reference

### Backend API Endpoints

#### Health Check
```
GET /api/health
```

#### Convert File Format
```
POST /api/convert
Form Data:
  - file: 3D model file
  - format: target format (stl, obj, etc.)
```

#### Scale Model
```
POST /api/scale
Form Data:
  - file: 3D model file
  - scale: scale factor (default: 0.02857 for 1/35)
  - unit: input unit (mm, cm, in, m)
```

#### Separate Parts
```
POST /api/separate
Form Data:
  - file: 3D model file
Returns: JSON with part information and categories
```

#### Generate Sprue
```
POST /api/generate-sprue
Form Data:
  - file: 3D model file
  - build_plate_x: build plate width (mm)
  - build_plate_y: build plate depth (mm)
  - build_plate_z: build plate height (mm)
```

#### Photo to Model
```
POST /api/photo-to-model
Form Data:
  - files: multiple image files
```

#### Printer Profiles
```
GET /api/printer-profiles
Returns: JSON with available printer profiles
```

## Building for Production

### Build for all platforms
```bash
npm run build
```

### Platform-specific builds
```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

Compiled applications will be in the `dist/` directory.

## Tips for Best Results

### For Optimal Part Separation
- Start with models that have distinct, separated parts
- Ensure proper geometry (watertight meshes work best)
- Clean up models in your 3D software before importing

### For Best Sprue Quality
- Smaller parts should be grouped together
- Larger parts may need their own sprue
- Orient parts to minimize support requirements
- Consider layer lines when positioning

### For Photo-to-3D Conversion
- Take photos from many angles (20+ recommended)
- Use consistent lighting
- Ensure good overlap between photos
- Use high-resolution images
- Avoid reflective surfaces

## Troubleshooting

### Backend Connection Issues
- Ensure Python backend is running
- Check that port 5000 is not in use
- Verify all Python dependencies are installed

### File Loading Issues
- Verify file format is supported
- Check file is not corrupted
- Try converting to STL first

### Memory Issues with Large Models
- Reduce polygon count before importing
- Split very large models manually
- Close other applications

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

MIT License - See LICENSE file for details

## Credits

Developed by the SprueCrafter Team

### Technologies Used
- Electron
- Python Flask
- Trimesh
- Three.js
- OpenCV
- PyMeshLab

## Support

For support, please open an issue on GitHub or contact the development team.

---

**SprueCrafter** - Professional sprue generation for the modern scale modeler
