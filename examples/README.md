# SprueCrafter Examples

This directory contains example files and scripts demonstrating SprueCrafter usage.

## Example Scripts

### api_examples.py

Demonstrates basic API usage with Python:
- File format conversion
- Model scaling
- Part separation
- Sprue generation

**Usage**:
```bash
# Make sure the backend is running first
python src/backend/app.py

# In another terminal, run the examples
python examples/api_examples.py
```

## Example Workflow

### Complete Model Processing Pipeline

1. **Start with a 3D model** (e.g., tank, aircraft, ship)
2. **Import into SprueCrafter**
3. **Convert format** if needed (to STL for printing)
4. **Scale to 1/35th** for model building
5. **Separate into parts** automatically
6. **Generate sprues** for each category
7. **Export for printing**

### Example: Processing a Tank Model

```python
import requests

# 1. Convert to STL
with open('tank.obj', 'rb') as f:
    response = requests.post(
        'http://127.0.0.1:5000/api/convert',
        files={'file': f},
        data={'format': 'stl'}
    )
    with open('tank.stl', 'wb') as out:
        out.write(response.content)

# 2. Scale to 1/35
with open('tank.stl', 'rb') as f:
    response = requests.post(
        'http://127.0.0.1:5000/api/scale',
        files={'file': f},
        data={'scale': 0.02857, 'unit': 'mm'}
    )
    with open('tank_1-35.stl', 'wb') as out:
        out.write(response.content)

# 3. Separate parts
with open('tank_1-35.stl', 'rb') as f:
    response = requests.post(
        'http://127.0.0.1:5000/api/separate',
        files={'file': f}
    )
    parts = response.json()
    print(f"Found {parts['total_parts']} parts")

# 4. Generate sprue
with open('tank_1-35.stl', 'rb') as f:
    response = requests.post(
        'http://127.0.0.1:5000/api/generate-sprue',
        files={'file': f},
        data={
            'build_plate_x': 143.43,
            'build_plate_y': 89.6,
            'build_plate_z': 175
        }
    )
    with open('tank_sprue.stl', 'wb') as out:
        out.write(response.content)
```

## Sample Models

Place your sample 3D models in this directory for testing.

Recommended test models:
- Simple geometric shapes (cube, sphere, cylinder)
- Vehicle models (tanks, aircraft, ships)
- Multi-part assemblies
- High-detail reference models

## Tips

1. **Start Simple**: Test with basic shapes first
2. **Check Scale**: Verify dimensions after scaling
3. **Review Parts**: Inspect separated parts before sprue generation
4. **Optimize Layout**: Adjust build plate settings for your printer
5. **Test Print**: Always test print a small section first

## Resources

- [User Guide](../docs/USER_GUIDE.md)
- [API Documentation](../docs/API.md)
- [Main README](../README.md)
