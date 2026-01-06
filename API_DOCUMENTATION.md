# SprueCrafter API Documentation

## Version 1.0.0

This document provides comprehensive documentation for the SprueCrafter Backend API.

## Base URL

```
http://localhost:5000/api
```

For production deployments, replace with your actual domain.

## Authentication

**Free Access (Default):** The app is completely free to use with no authentication required for all core features.

**Optional Pro Subscription:** Pro users can authenticate using an API key in the request header:

```
X-API-Key: your-pro-api-key-here
```

Pro subscription provides:
- Priority support
- Advanced batch processing
- API access for automation
- Early access to new features

## Rate Limiting

- **Free Users**: No rate limiting
- **Pro Users**: Enhanced rate limits and priority processing

## Error Handling

All endpoints return standard HTTP status codes and JSON error responses:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `413` - Payload Too Large
- `500` - Internal Server Error

## File Size Limits

- Maximum upload size: **500MB**
- Recommended size for optimal performance: **100MB**

## Supported File Formats

### 3D Model Formats
- STL (Standard Tessellation Language)
- OBJ (Wavefront OBJ)
- FBX (Filmbox)
- 3DS (3D Studio)
- PLY (Polygon File Format)
- GLTF/GLB (GL Transmission Format)
- DAE (Collada)

### Image Formats (for Photo-to-3D)
- JPG/JPEG
- PNG
- BMP
- TIFF

---

## Endpoints

### Health Check

Check if the API is running.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "message": "SprueCrafter API is running",
  "version": "1.0.0"
}
```

---

### Convert File Format

Convert a 3D model from one format to another.

**Endpoint:** `POST /api/convert`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required) - The 3D model file to convert
- `format` (optional) - Target format (default: `stl`)
  - Options: `stl`, `obj`, `ply`, `off`, `dae`

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/convert \
  -F "file=@model.obj" \
  -F "format=stl" \
  --output converted_model.stl
```

**Response:**
- Returns the converted file for download

**Error Codes:**
- `400` - No file provided, invalid format, or file type not allowed
- `500` - Conversion error

---

### Scale Model

Scale a 3D model to a specific scale (e.g., 1/35th scale).

**Endpoint:** `POST /api/scale`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required) - The 3D model file to scale
- `scale` (optional) - Scale factor (default: `0.02857` for 1/35 scale)
  - Range: `0 < scale <= 1000`
- `unit` (optional) - Input unit (default: `mm`)
  - Options: `mm`, `cm`, `in`, `m`

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/scale \
  -F "file=@model.stl" \
  -F "scale=0.02857" \
  -F "unit=mm" \
  --output scaled_model.stl
```

**Common Scales:**
- 1/35: `0.02857`
- 1/48: `0.02083`
- 1/72: `0.01389`
- 1/144: `0.00694`

**Response:**
- Returns the scaled file for download

**Error Codes:**
- `400` - No file, invalid scale value, or invalid unit
- `500` - Scaling error

---

### Separate Parts

Automatically separate a 3D model into individual parts and categorize them.

**Endpoint:** `POST /api/separate`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required) - The 3D model file to separate

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/separate \
  -F "file=@model.stl"
```

**Response:**
```json
{
  "total_parts": 15,
  "categories": {
    "body": 3,
    "turret": 2,
    "weapons": 4,
    "wheels": 6
  },
  "parts": [
    {
      "id": 0,
      "category": "body",
      "vertices": 1234,
      "faces": 2468,
      "volume": 123.45
    }
  ]
}
```

**Error Codes:**
- `400` - No file provided or file type not allowed
- `500` - Separation error

---

### Generate Sprue

Generate a professional sprue layout for resin 3D printing.

**Endpoint:** `POST /api/generate-sprue`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required) - The 3D model file (should be pre-scaled)
- `build_plate_x` (optional) - Build plate width in mm (default: `192`)
  - Range: `0 < x <= 500`
- `build_plate_y` (optional) - Build plate depth in mm (default: `120`)
  - Range: `0 < y <= 500`
- `build_plate_z` (optional) - Build plate height in mm (default: `245`)
  - Range: `0 < z <= 500`
- `connector_type` (optional) - Connector shape (default: `cylindrical`)
  - Options: `cylindrical`, `pyramid`, `triangular`, `square`, `spherical`

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/generate-sprue \
  -F "file=@scaled_model.stl" \
  -F "build_plate_x=192" \
  -F "build_plate_y=120" \
  -F "build_plate_z=245" \
  -F "connector_type=cylindrical" \
  --output sprue.stl
```

**Response:**
- Returns the sprue STL file for download

**Error Codes:**
- `400` - Invalid parameters or file type
- `500` - Sprue generation error

---

### Photo to 3D Model

Convert photographs to a 3D model using photogrammetry.

**Endpoint:** `POST /api/photo-to-model`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `files` (required) - Multiple image files (minimum 2, maximum 100)

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/photo-to-model \
  -F "files=@photo1.jpg" \
  -F "files=@photo2.jpg" \
  -F "files=@photo3.jpg" \
  --output reconstructed_model.stl
```

**Best Practices:**
- Use 20+ photos for better results
- Maintain consistent lighting
- Ensure good overlap between photos
- Use high-resolution images
- Avoid reflective surfaces

**Response:**
- Returns the reconstructed 3D model file

**Error Codes:**
- `400` - Less than 2 photos or more than 100 photos
- `500` - Reconstruction error

---

### Transform Model

Apply transformations to a 3D model (rotate, translate, or scale).

**Endpoint:** `POST /api/transform`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required) - The 3D model file to transform
- `operation` (required) - Transformation type
  - Options: `rotate`, `translate`, `scale`

**Rotation Parameters:**
- `axis` - Rotation axis: `x`, `y`, or `z`
- `angle` - Rotation angle in degrees
  - Range: `-360 <= angle <= 360`

**Translation Parameters:**
- `x` - X offset in mm (range: `-1000 to 1000`)
- `y` - Y offset in mm (range: `-1000 to 1000`)
- `z` - Z offset in mm (range: `-1000 to 1000`)

**Scale Parameters:**
- `factor` - Scale factor (range: `0.001 to 1000`)

**Example Requests:**

Rotate:
```bash
curl -X POST http://localhost:5000/api/transform \
  -F "file=@model.stl" \
  -F "operation=rotate" \
  -F "axis=z" \
  -F "angle=90" \
  --output rotated_model.stl
```

Translate:
```bash
curl -X POST http://localhost:5000/api/transform \
  -F "file=@model.stl" \
  -F "operation=translate" \
  -F "x=10" \
  -F "y=20" \
  -F "z=0" \
  --output translated_model.stl
```

Scale:
```bash
curl -X POST http://localhost:5000/api/transform \
  -F "file=@model.stl" \
  -F "operation=scale" \
  -F "factor=2.0" \
  --output scaled_model.stl
```

**Response:**
- Returns the transformed file for download

**Error Codes:**
- `400` - Invalid operation or parameters
- `500` - Transformation error

---

### Generate Supports

Generate support structures for 3D printing.

**Endpoint:** `POST /api/generate-supports`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required) - The 3D model file
- `mode` (required) - Support generation mode
  - Options: `automatic`, `manual`, `estimate`

**Automatic Mode Parameters:**
- `overhang_angle` (optional) - Angle threshold in degrees (default: `45`)
  - Range: `0 to 90`
- `density` (optional) - Support spacing in mm (default: `5`)
  - Range: `0.1 to 50`

**Manual Mode Parameters:**
- `support_points` (required) - JSON array of [x, y, z] coordinates

**Example Requests:**

Automatic:
```bash
curl -X POST http://localhost:5000/api/generate-supports \
  -F "file=@model.stl" \
  -F "mode=automatic" \
  -F "overhang_angle=45" \
  -F "density=5" \
  --output supported_model.stl
```

Manual:
```bash
curl -X POST http://localhost:5000/api/generate-supports \
  -F "file=@model.stl" \
  -F "mode=manual" \
  -F 'support_points=[[0,0,0],[10,10,5]]' \
  --output supported_model.stl
```

Estimate:
```bash
curl -X POST http://localhost:5000/api/generate-supports \
  -F "file=@model.stl" \
  -F "mode=estimate"
```

**Estimate Response:**
```json
{
  "support_required": true,
  "estimated_support_count": 42,
  "overhang_areas": 15,
  "critical_points": [[x, y, z], ...]
}
```

**Error Codes:**
- `400` - Invalid mode or parameters
- `500` - Support generation error

---

### Get Connector Types

Get available sprue connector types and descriptions.

**Endpoint:** `GET /api/connector-types`

**Response:**
```json
{
  "cylindrical": {
    "name": "Cylindrical",
    "description": "Traditional cylindrical connectors (standard)"
  },
  "pyramid": {
    "name": "Pyramid",
    "description": "Pyramid-shaped connectors"
  },
  "triangular": {
    "name": "Triangular",
    "description": "Triangular prism connectors"
  },
  "square": {
    "name": "Square",
    "description": "Square prism connectors"
  },
  "spherical": {
    "name": "Spherical",
    "description": "Spherical/beaded connectors"
  }
}
```

---

### Get Printer Profiles

Get available resin printer profiles with build volumes.

**Endpoint:** `GET /api/printer-profiles`

**Response:**
```json
{
  "elegoo_mars_3": {
    "name": "Elegoo Mars 3",
    "build_volume": {"x": 143.43, "y": 89.6, "z": 175}
  },
  "elegoo_saturn": {
    "name": "Elegoo Saturn",
    "build_volume": {"x": 192, "y": 120, "z": 200}
  },
  "custom": {
    "name": "Custom Printer",
    "build_volume": {"x": 192, "y": 120, "z": 245}
  }
}
```

---

## Workflow Examples

### Complete Model Preparation Workflow

1. **Import and Convert** (if needed)
```bash
curl -X POST http://localhost:5000/api/convert \
  -F "file=@original_model.obj" \
  -F "format=stl" \
  --output model.stl
```

2. **Scale to 1/35**
```bash
curl -X POST http://localhost:5000/api/scale \
  -F "file=@model.stl" \
  -F "scale=0.02857" \
  -F "unit=mm" \
  --output scaled_model.stl
```

3. **Separate Parts** (optional)
```bash
curl -X POST http://localhost:5000/api/separate \
  -F "file=@scaled_model.stl"
```

4. **Generate Sprue**
```bash
curl -X POST http://localhost:5000/api/generate-sprue \
  -F "file=@scaled_model.stl" \
  -F "build_plate_x=192" \
  -F "build_plate_y=120" \
  -F "build_plate_z=245" \
  -F "connector_type=cylindrical" \
  --output final_sprue.stl
```

5. **Add Supports**
```bash
curl -X POST http://localhost:5000/api/generate-supports \
  -F "file=@final_sprue.stl" \
  -F "mode=automatic" \
  -F "overhang_angle=45" \
  -F "density=5" \
  --output printable_sprue.stl
```

---

## Performance Considerations

### File Size
- Files under 50MB process in seconds
- Files 50-100MB may take 10-30 seconds
- Files over 100MB may take minutes

### Optimization Tips
1. Reduce polygon count before processing
2. Remove unnecessary geometry
3. Use appropriate file formats (STL for final output)
4. Close other applications for large files

---

## Troubleshooting

### Common Issues

**"File type not allowed"**
- Ensure file extension is supported
- Check file is not corrupted

**"File too large"**
- Reduce polygon count in your 3D editor
- Split model into smaller parts
- Maximum size is 500MB

**"Internal server error"**
- Check backend logs for details
- Ensure model is valid (watertight mesh)
- Try converting to STL first

**"Invalid input"**
- Verify parameter ranges
- Check JSON formatting for complex parameters
- Ensure units are correct

---

## Client Libraries

### Python Example
```python
import requests

# Upload and convert file
with open('model.obj', 'rb') as f:
    files = {'file': f}
    data = {'format': 'stl'}
    response = requests.post(
        'http://localhost:5000/api/convert',
        files=files,
        data=data
    )
    
    with open('converted.stl', 'wb') as out:
        out.write(response.content)
```

### JavaScript Example
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('format', 'stl');

fetch('http://localhost:5000/api/convert', {
  method: 'POST',
  body: formData
})
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.stl';
    a.click();
  });
```

---

## Support

For API issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review error messages in logs

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-01

---

## Pro Subscription Endpoints

### Subscribe to Pro

Create a Stripe checkout session for Pro subscription.

**Endpoint:** `POST /api/pro/subscribe`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"  // optional
}
```

**Response:**
```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_..."
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/pro/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe"}'
```

---

### Check Pro Status

Check if an API key is valid and get subscription status.

**Endpoint:** `GET /api/pro/status`

**Headers:**
```
X-API-Key: your-pro-api-key
```

**Response (Pro user):**
```json
{
  "is_pro": true,
  "name": "John Doe",
  "email": "user@example.com",
  "plan": "pro"
}
```

**Response (Invalid key):**
```json
{
  "is_pro": false,
  "message": "Invalid or expired API key"
}
```

**Example:**
```bash
curl http://localhost:5000/api/pro/status \
  -H "X-API-Key: your-pro-api-key"
```

---

### Stripe Webhook

Handles Stripe webhook events for subscription management. This endpoint is called by Stripe automatically.

**Endpoint:** `POST /api/pro/webhook`

**Headers:**
```
Stripe-Signature: webhook-signature
```

**Note:** This endpoint is for Stripe's use only. Configure the webhook URL in your Stripe dashboard:
`https://yourdomain.com/api/pro/webhook`

---

## Pro Features

When authenticated with a Pro API key, users get access to:

- **Priority Support**: Faster response times
- **Batch Processing**: Process multiple files at once
- **API Access**: Full programmatic access for automation
- **Early Access**: New features before general release
- **Support Development**: Help maintain and improve SprueCrafter

To use Pro features, include your API key in the header:
```
X-API-Key: your-pro-api-key-here
```

