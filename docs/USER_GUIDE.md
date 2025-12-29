# SprueCrafter User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Workflow Examples](#workflow-examples)
4. [Advanced Features](#advanced-features)
5. [Tips and Best Practices](#tips-and-best-practices)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### First Time Setup

1. Run the setup script for your platform:
   - **Windows**: Double-click `setup.bat`
   - **Mac/Linux**: Run `./setup.sh` in terminal

2. Launch SprueCrafter:
   ```bash
   npm start
   ```

3. The application window will open with a dark, modern interface

### Understanding the Interface

The SprueCrafter interface is divided into three main areas:

- **Left Sidebar**: Navigation menu for different tools
- **Center Area**: Main workspace for file operations
- **Bottom Bar**: Status information and backend connection

## Interface Overview

### Navigation Menu

#### Import Tab
- Primary file upload interface
- Drag-and-drop support
- File information display

#### Convert Tab
- Format conversion tool
- Supports 10+ 3D file formats
- Quick format selection

#### Scale Tab
- Model scaling interface
- Pre-configured scale ratios
- Custom scale input
- Unit conversion

#### Separate Tab
- Automatic part separation
- Category visualization
- Part statistics

#### Sprue Gen Tab
- Professional sprue generation
- Printer profile selection
- Build plate configuration

#### Photo2Model Tab
- Photogrammetry interface
- Multi-photo upload
- 3D reconstruction

#### 3D Viewer Tab
- Interactive 3D visualization
- Model inspection
- View controls

## Workflow Examples

### Example 1: Basic Model Scaling and Export

**Scenario**: Scale a 1:1 tank model to 1/35th scale for printing

1. **Import Model**
   - Click Import tab
   - Drag your model file (e.g., `tank.obj`) into the upload zone
   - Wait for file info to display

2. **Scale Model**
   - Click Scale tab
   - Select "1/35 Scale (Default)" from dropdown
   - Choose input unit (e.g., "Millimeters")
   - Click "Scale Model"
   - Choose save location

3. **Result**: You now have a properly scaled model ready for printing!

### Example 2: Creating Multi-Part Sprues

**Scenario**: Separate a model and create organized sprues

1. **Import and Scale**
   - Import your model
   - Scale to 1/35th (if needed)

2. **Separate Parts**
   - Click Separate tab
   - Click "Separate Parts"
   - Review categorized parts:
     - Body parts
     - Turret components
     - Weapons
     - Wheels
     - Details

3. **Generate Sprue**
   - Click Sprue Gen tab
   - Select your printer (e.g., "Elegoo Mars 3")
   - Click "Generate Sprue"
   - System creates optimized sprue layout

4. **Result**: Professional sprue file ready to print!

### Example 3: Photo to 3D Model

**Scenario**: Create 3D model from reference photos

1. **Prepare Photos**
   - Take 10-20 photos of subject from different angles
   - Ensure good lighting and overlap

2. **Import Photos**
   - Click Photo2Model tab
   - Click "Select Photos"
   - Choose all your photos
   - Preview thumbnails appear

3. **Generate Model**
   - Click "Generate 3D Model"
   - Wait for processing (may take several minutes)
   - Save generated model

4. **Refine**
   - Use 3D Viewer to inspect
   - Scale if needed
   - Generate sprue

### Example 4: Format Conversion

**Scenario**: Convert FBX file to STL for printing

1. **Import FBX**
   - Import your `.fbx` file

2. **Convert**
   - Click Convert tab
   - Select "STL" from format dropdown
   - Click "Convert File"
   - Choose save location

3. **Result**: Print-ready STL file!

## Advanced Features

### Custom Scale Factors

For specialized scales:

1. Select "Custom Scale" in Scale tab
2. Enter scale factor:
   - 1/35 = 0.02857
   - 1/48 = 0.02083
   - 1/72 = 0.01389
   - Formula: 1 / scale_number

### Custom Printer Profiles

For printers not in the list:

1. In Sprue Gen tab, select "Custom"
2. Enter your build plate dimensions:
   - Width (X axis)
   - Depth (Y axis)
   - Height (Z axis)
3. All dimensions in millimeters

### Part Orientation Optimization

SprueCrafter automatically optimizes part orientation to:
- Minimize support requirements
- Reduce build time
- Improve print quality

### Runner and Gate System

Professional sprue features:
- **Main Runners**: 2mm diameter central sprue
- **Gates**: 1mm connection points
- **Spacing**: Minimum 5mm between parts
- **Height**: Parts elevated 2mm above build plate

## Tips and Best Practices

### Model Preparation

1. **Clean Geometry**
   - Remove non-manifold edges
   - Ensure watertight meshes
   - Fix normals in your 3D software

2. **Poly Count**
   - Optimize mesh density
   - Use decimation for overly detailed models
   - Target: 10k-100k triangles per part

3. **Part Separation**
   - Pre-separate parts in CAD software for best results
   - Name parts descriptively (e.g., "turret_main", "wheel_01")
   - Group similar parts

### Printing Optimization

1. **Orientation**
   - Flat surfaces should face the build plate
   - Minimize overhangs
   - Consider layer lines on visible surfaces

2. **Support Strategy**
   - Use sprue gates as primary support
   - Add additional supports for large flat areas
   - Keep supports away from detail areas

3. **Build Plate Layout**
   - Don't overcrowd the build plate
   - Leave space for resin flow
   - Group similar-sized parts together

### Photo-to-3D Tips

1. **Photography**
   - Use tripod for consistent shots
   - Rotate object or camera 15-20° between shots
   - Overlap coverage by 70-80%
   - Use diffuse lighting

2. **Subject Preparation**
   - Matte surfaces work best
   - Reduce reflections with powder or spray
   - Use markers for feature tracking

3. **Processing**
   - More photos = better results
   - Minimum 10 photos, recommend 20+
   - Process high-resolution images

## Troubleshooting

### Application Won't Start

**Issue**: Electron window doesn't open

**Solutions**:
1. Check Node.js is installed: `node --version`
2. Reinstall dependencies: `npm install`
3. Check for port conflicts
4. Review console for errors

### Backend Connection Failed

**Issue**: Red status indicator in bottom right

**Solutions**:
1. Ensure Python is installed: `python --version`
2. Install Python dependencies: `pip install -r requirements.txt`
3. Check port 5000 is available
4. Manually start backend: `python src/backend/app.py`

### File Won't Load

**Issue**: Error loading 3D file

**Solutions**:
1. Verify file format is supported
2. Check file isn't corrupted (try opening in other 3D software)
3. Convert to STL first in another application
4. Check file size (max 500MB)

### Part Separation Not Working

**Issue**: Can't separate model into parts

**Solutions**:
1. Model may already be a single mesh
2. Try manual separation in 3D software first
3. Use connected component detection
4. Check mesh isn't a scene with multiple objects

### Sprue Generation Fails

**Issue**: Error generating sprue

**Solutions**:
1. Check model is scaled appropriately
2. Verify parts fit on build plate
3. Reduce number of parts if too many
4. Check build plate dimensions are correct

### Memory Issues

**Issue**: Application crashes with large models

**Solutions**:
1. Reduce polygon count before import
2. Separate very large models manually
3. Close other applications
4. Process parts individually
5. Increase system RAM if possible

### Photo Reconstruction Fails

**Issue**: Can't generate model from photos

**Solutions**:
1. Need minimum 2 photos (recommend 10+)
2. Ensure photos have sufficient overlap
3. Check image quality and resolution
4. Verify subject has sufficient texture
5. Reduce reflections on subject

## Getting Help

### Support Resources

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check docs/ folder for additional guides
- **Community**: Join discussions on project page

### Reporting Issues

When reporting bugs, please include:
1. SprueCrafter version
2. Operating system
3. Steps to reproduce
4. Error messages
5. Sample files (if applicable)

## Keyboard Shortcuts

### General
- `Ctrl/Cmd + O`: Open file
- `Ctrl/Cmd + S`: Save file
- `Ctrl/Cmd + Q`: Quit application

### 3D Viewer
- `Mouse Drag`: Rotate view
- `Mouse Wheel`: Zoom
- `Right Drag`: Pan view
- `R`: Reset view
- `+`: Zoom in
- `-`: Zoom out

---

For more information, visit the [SprueCrafter Documentation](../README.md)
