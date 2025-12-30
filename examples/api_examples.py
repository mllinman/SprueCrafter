"""
SprueCrafter Example Script
Demonstrates basic API usage for model processing
"""

import requests
import os

API_BASE = 'http://127.0.0.1:5000/api'

def check_api():
    """Check if API is running"""
    try:
        response = requests.get(f'{API_BASE}/health', timeout=2)
        if response.status_code == 200:
            print("✓ API is running")
            return True
    except:
        pass
    print("✗ API is not running. Please start the backend with: python src/backend/app.py")
    return False

def convert_example(input_file):
    """Example: Convert OBJ to STL"""
    print("\n=== File Conversion Example ===")
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found")
        return
    
    with open(input_file, 'rb') as f:
        files = {'file': f}
        data = {'format': 'stl'}
        
        print(f"Converting {input_file} to STL...")
        response = requests.post(f'{API_BASE}/convert', files=files, data=data)
        
        if response.status_code == 200:
            output_file = input_file.rsplit('.', 1)[0] + '_converted.stl'
            with open(output_file, 'wb') as out:
                out.write(response.content)
            print(f"✓ Converted file saved to: {output_file}")
        else:
            print(f"✗ Conversion failed: {response.text}")

def scale_example(input_file, scale=1/35):
    """Example: Scale model to 1/35"""
    print("\n=== Model Scaling Example ===")
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found")
        return
    
    with open(input_file, 'rb') as f:
        files = {'file': f}
        data = {'scale': scale, 'unit': 'mm'}
        
        print(f"Scaling {input_file} to 1/{int(1/scale)} scale...")
        response = requests.post(f'{API_BASE}/scale', files=files, data=data)
        
        if response.status_code == 200:
            output_file = input_file.rsplit('.', 1)[0] + '_scaled.stl'
            with open(output_file, 'wb') as out:
                out.write(response.content)
            print(f"✓ Scaled file saved to: {output_file}")
        else:
            print(f"✗ Scaling failed: {response.text}")

def separate_example(input_file):
    """Example: Separate model into parts"""
    print("\n=== Part Separation Example ===")
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found")
        return
    
    with open(input_file, 'rb') as f:
        files = {'file': f}
        
        print(f"Separating parts in {input_file}...")
        response = requests.post(f'{API_BASE}/separate', files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Found {data['total_parts']} parts")
            print("\nParts by category:")
            for category, parts in data['categorized'].items():
                if parts:
                    print(f"  {category}: {len(parts)} parts")
        else:
            print(f"✗ Separation failed: {response.text}")

def sprue_example(input_file, printer='elegoo_mars_3'):
    """Example: Generate sprue for printing"""
    print("\n=== Sprue Generation Example ===")
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found")
        return
    
    # Get printer profile
    profiles = requests.get(f'{API_BASE}/printer-profiles').json()
    profile = profiles.get(printer, profiles['custom'])
    
    print(f"Generating sprue for {profile['name']}...")
    print(f"Build plate: {profile['build_volume']['x']}x{profile['build_volume']['y']}x{profile['build_volume']['z']}mm")
    
    with open(input_file, 'rb') as f:
        files = {'file': f}
        data = {
            'build_plate_x': profile['build_volume']['x'],
            'build_plate_y': profile['build_volume']['y'],
            'build_plate_z': profile['build_volume']['z']
        }
        
        response = requests.post(f'{API_BASE}/generate-sprue', files=files, data=data)
        
        if response.status_code == 200:
            output_file = input_file.rsplit('.', 1)[0] + '_sprue.stl'
            with open(output_file, 'wb') as out:
                out.write(response.content)
            print(f"✓ Sprue file saved to: {output_file}")
        else:
            print(f"✗ Sprue generation failed: {response.text}")

def main():
    """Main example runner"""
    print("=================================")
    print("SprueCrafter API Examples")
    print("=================================")
    
    # Check if API is running
    if not check_api():
        return
    
    # Example file (you'll need to provide your own)
    example_file = "examples/sample_model.stl"
    
    print(f"\nUsing example file: {example_file}")
    print("(Replace with your own 3D model file)")
    
    # Run examples
    if os.path.exists(example_file):
        convert_example(example_file)
        scale_example(example_file)
        separate_example(example_file)
        sprue_example(example_file)
    else:
        print(f"\nTo run examples, place a 3D model file at: {example_file}")
        print("Or modify this script to use your own file path.")

if __name__ == '__main__':
    main()
