#!/usr/bin/env python3
"""
SprueCrafter - Complete Workflow Example
Demonstrates a full end-to-end workflow from model to sprue
"""

import requests
import os
import sys

BASE_URL = "http://127.0.0.1:5000"

def print_step(step_num, description):
    print(f"\n{'='*60}")
    print(f"Step {step_num}: {description}")
    print('='*60)

def check_backend():
    """Check if backend is running"""
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
    except:
        pass
    
    print("❌ Backend is not running!")
    print("Please start it first: python src/backend/app.py")
    return False

def create_sample_model():
    """Create a simple sample model for testing"""
    print_step(1, "Creating Sample Model")
    
    try:
        import trimesh
        import numpy as np
        
        # Create a simple tank-like shape
        # Base (body)
        body = trimesh.creation.box(extents=[40, 30, 10])
        body.apply_translation([0, 0, 5])
        
        # Turret
        turret = trimesh.creation.cylinder(radius=12, height=8)
        turret.apply_translation([0, 0, 14])
        
        # Gun barrel
        barrel = trimesh.creation.cylinder(radius=1.5, height=30)
        barrel.apply_transform(trimesh.transformations.rotation_matrix(
            np.pi/2, [0, 1, 0]
        ))
        barrel.apply_translation([15, 0, 14])
        
        # Combine all parts
        model = trimesh.util.concatenate([body, turret, barrel])
        
        # Save
        input_file = '/tmp/sample_tank.stl'
        model.export(input_file)
        
        print(f"✅ Sample tank model created: {input_file}")
        print(f"   Vertices: {len(model.vertices)}")
        print(f"   Faces: {len(model.faces)}")
        print(f"   Dimensions: {model.extents}")
        
        return input_file
    
    except Exception as e:
        print(f"❌ Failed to create sample model: {e}")
        return None

def convert_to_stl(input_file):
    """Convert model to STL format"""
    print_step(2, "Convert to STL Format")
    
    if input_file.endswith('.stl'):
        print("✅ Already in STL format")
        return input_file
    
    try:
        with open(input_file, 'rb') as f:
            response = requests.post(
                f"{BASE_URL}/api/convert",
                files={'file': f},
                data={'format': 'stl'},
                timeout=30
            )
        
        if response.status_code == 200:
            output_file = '/tmp/converted.stl'
            with open(output_file, 'wb') as f:
                f.write(response.content)
            print(f"✅ Converted to STL: {output_file}")
            return output_file
        else:
            print(f"❌ Conversion failed: {response.status_code}")
            return None
    
    except Exception as e:
        print(f"❌ Error during conversion: {e}")
        return None

def scale_to_1_35(input_file):
    """Scale model to 1/35 scale"""
    print_step(3, "Scale to 1/35")
    
    try:
        with open(input_file, 'rb') as f:
            response = requests.post(
                f"{BASE_URL}/api/scale",
                files={'file': f},
                data={
                    'scale': 0.02857,  # 1/35 scale
                    'unit': 'mm'
                },
                timeout=30
            )
        
        if response.status_code == 200:
            output_file = '/tmp/scaled_1-35.stl'
            with open(output_file, 'wb') as f:
                f.write(response.content)
            print(f"✅ Scaled to 1/35: {output_file}")
            
            # Show size comparison
            import trimesh
            original = trimesh.load(input_file)
            scaled = trimesh.load(output_file)
            print(f"   Original size: {original.extents}")
            print(f"   Scaled size: {scaled.extents}")
            
            return output_file
        else:
            print(f"❌ Scaling failed: {response.status_code}")
            return None
    
    except Exception as e:
        print(f"❌ Error during scaling: {e}")
        return None

def separate_parts(input_file):
    """Separate model into parts"""
    print_step(4, "Separate Parts")
    
    try:
        with open(input_file, 'rb') as f:
            response = requests.post(
                f"{BASE_URL}/api/separate",
                files={'file': f},
                timeout=30
            )
        
        if response.status_code == 200:
            parts = response.json()
            print(f"✅ Separated into {parts['total_parts']} parts")
            
            # Show categorization
            for category, items in parts['categorized'].items():
                if items:
                    print(f"   {category}: {len(items)} parts")
            
            return parts
        else:
            print(f"❌ Separation failed: {response.status_code}")
            return None
    
    except Exception as e:
        print(f"❌ Error during separation: {e}")
        return None

def generate_sprue(input_file):
    """Generate sprue for resin printing"""
    print_step(5, "Generate Sprue")
    
    try:
        # Use Elegoo Saturn as default printer
        printer = {
            'name': 'Elegoo Saturn',
            'build_plate_x': 192,
            'build_plate_y': 120,
            'build_plate_z': 245
        }
        
        print(f"   Using printer: {printer['name']}")
        print(f"   Build volume: {printer['build_plate_x']}×{printer['build_plate_y']}×{printer['build_plate_z']}mm")
        
        with open(input_file, 'rb') as f:
            response = requests.post(
                f"{BASE_URL}/api/generate-sprue",
                files={'file': f},
                data={
                    'build_plate_x': printer['build_plate_x'],
                    'build_plate_y': printer['build_plate_y'],
                    'build_plate_z': printer['build_plate_z'],
                    'connector_type': 'cylindrical'
                },
                timeout=30
            )
        
        if response.status_code == 200:
            output_file = '/tmp/final_sprue.stl'
            with open(output_file, 'wb') as f:
                f.write(response.content)
            
            # Get file size
            size_kb = os.path.getsize(output_file) / 1024
            
            print(f"✅ Sprue generated: {output_file}")
            print(f"   File size: {size_kb:.1f} KB")
            print(f"   Connector type: cylindrical")
            print(f"   Ready to print!")
            
            return output_file
        else:
            print(f"❌ Sprue generation failed: {response.status_code}")
            return None
    
    except Exception as e:
        print(f"❌ Error during sprue generation: {e}")
        return None

def main():
    print("="*60)
    print("SprueCrafter - Complete Workflow Example")
    print("="*60)
    print("\nThis script demonstrates a complete workflow:")
    print("1. Create a sample model")
    print("2. Convert to STL")
    print("3. Scale to 1/35")
    print("4. Separate parts")
    print("5. Generate sprue for printing")
    
    # Check backend
    if not check_backend():
        return 1
    
    # Run workflow
    try:
        # Step 1: Create sample
        input_file = create_sample_model()
        if not input_file:
            return 1
        
        # Step 2: Convert (if needed)
        stl_file = convert_to_stl(input_file)
        if not stl_file:
            return 1
        
        # Step 3: Scale
        scaled_file = scale_to_1_35(stl_file)
        if not scaled_file:
            return 1
        
        # Step 4: Separate
        parts = separate_parts(scaled_file)
        if not parts:
            return 1
        
        # Step 5: Generate sprue
        sprue_file = generate_sprue(scaled_file)
        if not sprue_file:
            return 1
        
        # Success!
        print("\n" + "="*60)
        print("✅ WORKFLOW COMPLETE!")
        print("="*60)
        print(f"\nFinal sprue file: {sprue_file}")
        print("You can now slice and print this file on your resin printer!")
        print("\nIntermediate files saved in /tmp/:")
        print(f"  - Original model: {input_file}")
        print(f"  - Scaled model: {scaled_file}")
        print(f"  - Final sprue: {sprue_file}")
        
        return 0
    
    except Exception as e:
        print(f"\n❌ Workflow failed: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
