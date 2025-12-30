# SprueCrafter API Documentation

## Overview

SprueCrafter provides a RESTful API for 3D model processing. The backend runs on Flask and provides endpoints for file conversion, scaling, part separation, and sprue generation.

## Base URL

```
http://127.0.0.1:5000/api
```

## Authentication

Currently, no authentication is required for local API access.

## Endpoints

### Health Check

Check if the API is running and healthy.

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "ok",
  "message": "SprueCrafter API is running"
}
```

---

### Convert File Format

Convert a 3D model from one format to another.

**Endpoint**: `POST /api/convert`

**Request**:
- Content-Type: `multipart/form-data`
- Body:
  - `file` (file): The 3D model file
  - `format` (string): Target format (stl, obj, ply, gltf, glb, etc.)

**Example**:
```bash
curl -X POST http://127.0.0.1:5000/api/convert \
  -F "file=@model.obj" \
  -F "format=stl" \
  -o converted.stl
```

**Response**: Binary STL file

**Supported Formats**:
- Input: STL, OBJ, FBX, 3DS, PLY, GLTF, GLB, DAE, STEP, IGES
- Output: STL, OBJ, PLY, GLTF, GLB, DAE

---

### Scale Model

Scale a 3D model to a specific scale ratio.

**Endpoint**: `POST /api/scale`

**Request**:
- Content-Type: `multipart/form-data`
- Body:
  - `file` (file): The 3D model file
  - `scale` (float): Scale factor (e.g., 0.02857 for 1/35)
  - `unit` (string): Input unit (mm, cm, in, m)

**Example**:
```bash
curl -X POST http://127.0.0.1:5000/api/scale \
  -F "file=@tank.obj" \
  -F "scale=0.02857" \
  -F "unit=mm" \
  -o scaled_tank.stl
```

**Response**: Binary scaled model file

**Common Scale Factors**:
- 1/35: 0.02857
- 1/48: 0.02083
- 1/72: 0.01389
- 1/144: 0.00694

---

### Separate Parts

Automatically separate a model into individual parts and categorize them.

**Endpoint**: `POST /api/separate`

**Request**:
- Content-Type: `multipart/form-data`
- Body:
  - `file` (file): The 3D model file

**Example**:
```bash
curl -X POST http://127.0.0.1:5000/api/separate \
  -F "file=@model.stl"
```

**Response**:
```json
{
  "total_parts": 15,
  "parts": [
    {
      "name": "part_0",
      "file": "/tmp/part_0.stl",
      "vertices": 1523,
      "faces": 3046,
      "volume": 1250.5,
      "surface_area": 850.2,
      "bounds": [[0, 0, 0], [50, 30, 20]],
      "extents": [50, 30, 20],
      "center": [25, 15, 10],
      "category": "body"
    }
  ],
  "categorized": {
    "body": [...],
    "turret": [...],
    "weapons": [...],
    "wheels": [...],
    "details": [...],
    "accessories": [...]
  }
}
```

**Part Categories**:
- `body`: Main hull, fuselage, chassis
- `turret`: Turret and gun mounts
- `weapons`: Guns, cannons, weapons
- `wheels`: Wheels, tracks, suspension
- `details`: Antennas, hatches, vents
- `accessories`: Figures, crew, bases

---

### Generate Sprue

Generate an optimized sprue layout for resin printing.

**Endpoint**: `POST /api/generate-sprue`

**Request**:
- Content-Type: `multipart/form-data`
- Body:
  - `file` (file): The 3D model file
  - `build_plate_x` (float): Build plate width in mm
  - `build_plate_y` (float): Build plate depth in mm
  - `build_plate_z` (float): Build plate height in mm

**Example**:
```bash
curl -X POST http://127.0.0.1:5000/api/generate-sprue \
  -F "file=@model.stl" \
  -F "build_plate_x=143.43" \
  -F "build_plate_y=89.6" \
  -F "build_plate_z=175" \
  -o sprue.stl
```

**Response**: Binary STL file with sprue layout

**Sprue Parameters**:
- Runner diameter: 2.0mm
- Gate diameter: 1.0mm
- Gate height: 2.0mm
- Part spacing: 5.0mm minimum
- Border margin: 5.0mm

---

### Photo to Model

Convert multiple photographs to a 3D model using photogrammetry.

**Endpoint**: `POST /api/photo-to-model`

**Request**:
- Content-Type: `multipart/form-data`
- Body:
  - `files` (files): Multiple image files

**Example**:
```bash
curl -X POST http://127.0.0.1:5000/api/photo-to-model \
  -F "files=@photo1.jpg" \
  -F "files=@photo2.jpg" \
  -F "files=@photo3.jpg" \
  -o model.stl
```

**Response**: Binary STL file

**Requirements**:
- Minimum 2 photos (10+ recommended)
- Supported formats: JPG, JPEG, PNG, BMP, TIFF
- Good overlap between photos
- Consistent lighting

---

### Get Printer Profiles

Get available resin printer build plate profiles.

**Endpoint**: `GET /api/printer-profiles`

**Example**:
```bash
curl http://127.0.0.1:5000/api/printer-profiles
```

**Response**:
```json
{
  "elegoo_mars_3": {
    "name": "Elegoo Mars 3",
    "build_volume": {
      "x": 143.43,
      "y": 89.6,
      "z": 175
    }
  },
  "anycubic_photon_mono_4k": {
    "name": "Anycubic Photon Mono 4K",
    "build_volume": {
      "x": 132,
      "y": 80,
      "z": 165
    }
  },
  "phrozen_sonic_mighty_4k": {
    "name": "Phrozen Sonic Mighty 4K",
    "build_volume": {
      "x": 200,
      "y": 125,
      "z": 220
    }
  },
  "creality_halot_one": {
    "name": "Creality Halot One",
    "build_volume": {
      "x": 127,
      "y": 80,
      "z": 160
    }
  },
  "custom": {
    "name": "Custom Printer",
    "build_volume": {
      "x": 192,
      "y": 120,
      "z": 245
    }
  }
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid input
- `500 Internal Server Error`: Server error

**Error Response Format**:
```json
{
  "error": "Error message description"
}
```

## Rate Limiting

Currently, no rate limiting is implemented for local use.

## Python Client Example

```python
import requests

# Convert file
with open('model.obj', 'rb') as f:
    files = {'file': f}
    data = {'format': 'stl'}
    response = requests.post(
        'http://127.0.0.1:5000/api/convert',
        files=files,
        data=data
    )
    
    with open('converted.stl', 'wb') as out:
        out.write(response.content)

# Scale model
with open('tank.stl', 'rb') as f:
    files = {'file': f}
    data = {
        'scale': 0.02857,  # 1/35 scale
        'unit': 'mm'
    }
    response = requests.post(
        'http://127.0.0.1:5000/api/scale',
        files=files,
        data=data
    )
    
    with open('scaled_tank.stl', 'wb') as out:
        out.write(response.content)

# Get part information
with open('model.stl', 'rb') as f:
    files = {'file': f}
    response = requests.post(
        'http://127.0.0.1:5000/api/separate',
        files=files
    )
    parts_info = response.json()
    print(f"Found {parts_info['total_parts']} parts")
```

## JavaScript Client Example

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Convert file
const convertFile = async () => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream('model.obj'));
  formData.append('format', 'stl');
  
  const response = await axios.post(
    'http://127.0.0.1:5000/api/convert',
    formData,
    {
      headers: formData.getHeaders(),
      responseType: 'blob'
    }
  );
  
  fs.writeFileSync('converted.stl', response.data);
};

// Generate sprue
const generateSprue = async () => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream('model.stl'));
  formData.append('build_plate_x', 143.43);
  formData.append('build_plate_y', 89.6);
  formData.append('build_plate_z', 175);
  
  const response = await axios.post(
    'http://127.0.0.1:5000/api/generate-sprue',
    formData,
    {
      headers: formData.getHeaders(),
      responseType: 'blob'
    }
  );
  
  fs.writeFileSync('sprue.stl', response.data);
};
```

## Support

For API issues or questions, please open an issue on GitHub.
