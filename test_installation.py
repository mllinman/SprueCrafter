#!/usr/bin/env python3
"""
SprueCrafter Installation Test Script
Tests that all core components are working correctly
"""

import sys
import os
import tempfile
import requests
import time
import subprocess
import signal

def print_header(text):
    print("\n" + "="*60)
    print(text)
    print("="*60)

def print_test(text):
    print(f"\n🔍 Testing: {text}...")

def print_success(text):
    print(f"✅ {text}")

def print_error(text):
    print(f"❌ {text}")

def print_warning(text):
    print(f"⚠️  {text}")

def check_dependencies():
    print_header("Checking Dependencies")
    
    # Check Python
    print_test("Python version")
    version = sys.version
    print(f"   Found: {version}")
    if sys.version_info < (3, 8):
        print_error("Python 3.8 or higher required")
        return False
    print_success("Python version OK")
    
    # Check required Python packages
    required_packages = {
        'trimesh': 'trimesh',
        'numpy': 'numpy',
        'flask': 'flask',
        'flask_cors': 'flask-cors',
        'cv2': 'opencv-python',
        'PIL': 'Pillow',
        'scipy': 'scipy'
    }
    
    print_test("Python packages")
    missing = []
    for import_name, package_name in required_packages.items():
        try:
            __import__(import_name)
            print_success(f"{package_name} installed")
        except ImportError:
            print_error(f"{package_name} NOT installed")
            missing.append(package_name)
    
    if missing:
        print_error(f"Missing packages: {', '.join(missing)}")
        print("   Run: pip3 install -r requirements.txt")
        return False
    
    return True

def create_test_model():
    """Create a simple test STL file"""
    import trimesh
    import numpy as np
    
    vertices = np.array([
        [-10, -10, -10], [10, -10, -10], [10, 10, -10], [-10, 10, -10],
        [-10, -10, 10], [10, -10, 10], [10, 10, 10], [-10, 10, 10]
    ])
    
    faces = np.array([
        [0, 1, 2], [0, 2, 3],
        [4, 6, 5], [4, 7, 6],
        [0, 4, 5], [0, 5, 1],
        [2, 6, 7], [2, 7, 3],
        [0, 3, 7], [0, 7, 4],
        [1, 5, 6], [1, 6, 2]
    ])
    
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
    
    temp_file = os.path.join(tempfile.gettempdir(), 'test_model.stl')
    mesh.export(temp_file)
    return temp_file

def test_backend_api():
    print_header("Testing Backend API")
    
    base_url = "http://127.0.0.1:5000"
    
    # Test health endpoint
    print_test("Health check")
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'ok':
                print_success("Backend is running")
            else:
                print_error("Backend returned unexpected status")
                return False
        else:
            print_error(f"Backend returned status code {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend")
        print("   Make sure the backend is running: python src/backend/app.py")
        return False
    except Exception as e:
        print_error(f"Error testing backend: {str(e)}")
        return False
    
    # Test printer profiles
    print_test("Printer profiles")
    try:
        response = requests.get(f"{base_url}/api/printer-profiles", timeout=5)
        if response.status_code == 200:
            profiles = response.json()
            print_success(f"Found {len(profiles)} printer profiles")
        else:
            print_error("Failed to get printer profiles")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False
    
    # Test connector types
    print_test("Connector types")
    try:
        response = requests.get(f"{base_url}/api/connector-types", timeout=5)
        if response.status_code == 200:
            connectors = response.json()
            print_success(f"Found {len(connectors)} connector types")
        else:
            print_error("Failed to get connector types")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False
    
    # Create test model
    print_test("Creating test model")
    try:
        test_file = create_test_model()
        print_success(f"Test model created: {test_file}")
    except Exception as e:
        print_error(f"Failed to create test model: {str(e)}")
        return False
    
    # Test file conversion
    print_test("File conversion (STL to OBJ)")
    try:
        with open(test_file, 'rb') as f:
            files = {'file': f}
            data = {'format': 'obj'}
            response = requests.post(f"{base_url}/api/convert", files=files, data=data, timeout=30)
        
        if response.status_code == 200:
            print_success("File conversion successful")
        else:
            print_error(f"File conversion failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False
    
    # Test scaling
    print_test("Model scaling (1/35)")
    try:
        with open(test_file, 'rb') as f:
            files = {'file': f}
            data = {'scale': '0.02857', 'unit': 'mm'}
            response = requests.post(f"{base_url}/api/scale", files=files, data=data, timeout=30)
        
        if response.status_code == 200:
            scaled_file = os.path.join(tempfile.gettempdir(), 'test_scaled.stl')
            with open(scaled_file, 'wb') as f:
                f.write(response.content)
            print_success("Model scaling successful")
        else:
            print_error(f"Model scaling failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False
    
    # Test sprue generation
    print_test("Sprue generation")
    try:
        with open(scaled_file, 'rb') as f:
            files = {'file': f}
            data = {
                'build_plate_x': '192',
                'build_plate_y': '120',
                'build_plate_z': '245',
                'connector_type': 'cylindrical'
            }
            response = requests.post(f"{base_url}/api/generate-sprue", files=files, data=data, timeout=30)
        
        if response.status_code == 200:
            print_success("Sprue generation successful")
        else:
            print_error(f"Sprue generation failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False
    
    # Test part separation
    print_test("Part separation")
    try:
        with open(scaled_file, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{base_url}/api/separate", files=files, timeout=30)
        
        if response.status_code == 200:
            parts = response.json()
            print_success(f"Part separation successful - found {parts.get('total_parts', 0)} parts")
        else:
            print_error(f"Part separation failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False
    
    return True

def test_core_modules():
    print_header("Testing Core Modules")
    
    sys.path.insert(0, os.path.join(os.getcwd(), 'src', 'backend'))
    
    modules_to_test = [
        ('core.file_converter', 'FileConverter'),
        ('core.scale_converter', 'ScaleConverter'),
        ('core.part_separator', 'PartSeparator'),
        ('core.sprue_generator', 'SprueGenerator'),
        ('core.support_generator', 'SupportGenerator'),
        ('core.transformer', 'Transformer'),
        ('core.photo_to_model', 'PhotoToModel')
    ]
    
    for module_name, class_name in modules_to_test:
        print_test(f"{module_name}")
        try:
            module = __import__(module_name, fromlist=[class_name])
            cls = getattr(module, class_name)
            instance = cls()
            print_success(f"{class_name} loaded successfully")
        except Exception as e:
            print_error(f"Failed to load {class_name}: {str(e)}")
            return False
    
    return True

def main():
    print_header("SprueCrafter Installation Test")
    print("This script will verify your SprueCrafter installation")
    
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    all_tests_passed = True
    
    # Check dependencies
    if not check_dependencies():
        all_tests_passed = False
    
    # Test core modules
    if not test_core_modules():
        all_tests_passed = False
    
    # Test backend API (only if backend is running)
    print("\n" + "-"*60)
    print("Note: Backend API tests require the backend to be running")
    print("Start it in another terminal: python src/backend/app.py")
    print("-"*60)
    
    response = input("\nIs the backend running? (y/n): ").strip().lower()
    if response == 'y':
        if not test_backend_api():
            all_tests_passed = False
    else:
        print_warning("Skipping backend API tests")
    
    # Summary
    print_header("Test Summary")
    if all_tests_passed:
        print_success("All tests passed! SprueCrafter is ready to use.")
        print("\nTo start the application:")
        print("  npm start")
        return 0
    else:
        print_error("Some tests failed. Please check the errors above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
