# SprueCrafter Project Structure

```
SprueCrafter/
├── README.md                          # Main project documentation
├── LICENSE                            # MIT License
├── package.json                       # Node.js dependencies and scripts
├── requirements.txt                   # Python dependencies
├── setup.sh                          # Unix/Mac setup script
├── setup.bat                         # Windows setup script
├── .gitignore                        # Git ignore patterns
│
├── docs/                             # Documentation
│   ├── USER_GUIDE.md                 # Comprehensive user guide
│   └── API.md                        # API documentation
│
├── examples/                         # Example scripts and usage
│   ├── README.md                     # Examples documentation
│   └── api_examples.py               # Python API usage examples
│
├── src/
│   ├── backend/                      # Python Flask backend
│   │   ├── app.py                    # Main Flask application
│   │   └── core/                     # Core processing modules
│   │       ├── __init__.py           # Module initialization
│   │       ├── file_converter.py     # 3D file format conversion
│   │       ├── scale_converter.py    # Model scaling engine
│   │       ├── part_separator.py     # Automatic part separation
│   │       ├── sprue_generator.py    # Sprue generation system
│   │       └── photo_to_model.py     # Photogrammetry conversion
│   │
│   └── electron/                     # Electron frontend
│       ├── main.js                   # Electron main process
│       ├── index.html                # Main UI interface
│       ├── styles.css                # Dark theme styling
│       └── renderer.js               # UI logic and API client
│
└── assets/                           # Application assets (icons, images)
```

## File Overview

### Backend Components

#### `app.py` (Flask API Server)
- REST API endpoints
- File upload handling
- Request routing
- CORS configuration
- Error handling

#### `file_converter.py`
- Universal 3D file format conversion
- Supports: STL, OBJ, FBX, 3DS, PLY, GLTF, GLB, DAE
- Mesh information extraction
- Format validation

#### `scale_converter.py`
- Model scaling to standard scales (1/35, 1/48, 1/72, etc.)
- Unit conversion (mm, cm, in, m)
- Custom scale support
- Real-world dimension calculation

#### `part_separator.py`
- Automatic mesh splitting
- Connected component analysis
- Part categorization:
  - Body parts
  - Turret components
  - Weapons
  - Wheels/Tracks
  - Details
  - Accessories
- Orientation optimization

#### `sprue_generator.py`
- Professional sprue layout generation
- Bin packing algorithm
- Runner system creation (2mm diameter)
- Gate system (1mm connections)
- Build plate optimization
- Multi-sprue set generation

#### `photo_to_model.py`
- Photogrammetry pipeline
- Feature detection (ORB/SIFT)
- Point cloud generation
- Mesh reconstruction
- Relief model creation
- Single-image depth estimation

### Frontend Components

#### `main.js` (Electron Main Process)
- Window management
- Python backend integration
- IPC handlers
- File dialogs
- Application lifecycle

#### `index.html` (UI Structure)
- 7 main functional tabs:
  1. Import - File upload
  2. Convert - Format conversion
  3. Scale - Model scaling
  4. Separate - Part separation
  5. Sprue Gen - Sprue generation
  6. Photo2Model - Photogrammetry
  7. 3D Viewer - Model visualization
- Modern navigation
- Status indicators

#### `styles.css` (Dark Theme)
- Dark background (#1a1a1a)
- Bright cyan accents (#00e5ff)
- Modern, sleek design
- Responsive layout
- Custom scrollbars
- Smooth animations

#### `renderer.js` (Frontend Logic)
- API communication
- File handling
- UI state management
- Form validation
- Status updates
- Error handling

## Dependencies

### Python (Backend)
- **Flask** - Web framework
- **trimesh** - 3D mesh processing
- **numpy** - Numerical computing
- **scipy** - Scientific computing
- **pymeshlab** - Advanced mesh operations
- **opencv-python** - Image processing
- **open3d** - 3D data processing
- **pillow** - Image handling

### Node.js (Frontend)
- **Electron** - Desktop application framework
- **Three.js** - 3D visualization
- **axios** - HTTP client

## API Endpoints

### Core Endpoints
- `GET /api/health` - Health check
- `POST /api/convert` - File format conversion
- `POST /api/scale` - Model scaling
- `POST /api/separate` - Part separation
- `POST /api/generate-sprue` - Sprue generation
- `POST /api/photo-to-model` - Photo conversion
- `GET /api/printer-profiles` - Printer configurations

## Key Features

### Professional Quality
- Industry-standard sprue layouts
- Optimized runner and gate systems
- Minimal support requirements
- Efficient build plate usage

### Universal Compatibility
- 10+ 3D file formats
- All major resin printers
- Cross-platform (Windows, Mac, Linux)
- Custom printer profiles

### Advanced Processing
- Intelligent part separation
- Automatic categorization
- Scale conversion
- Photogrammetry support

### Modern Interface
- Dark theme with bright accents
- Intuitive navigation
- Drag-and-drop uploads
- Real-time status updates
- 3D visualization

## Usage Workflow

1. **Import** 3D model file
2. **Convert** format if needed
3. **Scale** to 1/35th (or custom)
4. **Separate** into parts
5. **Generate** professional sprue
6. **Export** for resin printing

## Development

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
python -m pytest tests/
```

## Supported Printers

- Elegoo Mars 3 (143.43×89.6×175mm)
- Anycubic Photon Mono 4K (132×80×165mm)
- Phrozen Sonic Mighty 4K (200×125×220mm)
- Creality Halot One (127×80×160mm)
- Custom configurations

## Future Enhancements

Potential features for future versions:
- Advanced photogrammetry integration (COLMAP, Meshroom)
- Machine learning for part classification
- Automated support generation
- Multi-material support
- Cloud processing
- Model marketplace integration
- Advanced mesh repair tools
- Texture mapping support

## License

MIT License - Open source and free to use

## Support

- GitHub Issues for bug reports
- Documentation in `/docs`
- Examples in `/examples`
