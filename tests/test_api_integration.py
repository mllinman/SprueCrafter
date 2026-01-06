#!/usr/bin/env python3
"""
Integration test script for SprueCrafter advanced features API endpoints
Tests the new features: Island Detection, Mesh Repair, Hollowing, and Batch Processing
"""

import requests
import tempfile
import os
import time
import trimesh
from pathlib import Path

# API base URL
BASE_URL = "http://localhost:5000/api"

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'


def create_test_model(filename):
    """Create a simple test STL file"""
    mesh = trimesh.creation.box(extents=[20, 20, 20])
    mesh.export(filename)
    return filename


def test_health():
    """Test health check endpoint"""
    print(f"\n{YELLOW}Testing Health Check...{RESET}")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"{GREEN}✓ Health check passed{RESET}")
            print(f"  Status: {data.get('status')}")
            print(f"  Version: {data.get('version')}")
            return True
        else:
            print(f"{RED}✗ Health check failed: {response.status_code}{RESET}")
            return False
    except Exception as e:
        print(f"{RED}✗ Health check error: {e}{RESET}")
        return False


def test_island_detection():
    """Test island detection endpoint"""
    print(f"\n{YELLOW}Testing Island Detection...{RESET}")
    
    with tempfile.NamedTemporaryFile(suffix='.stl', delete=False) as f:
        test_file = create_test_model(f.name)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': ('test.stl', f, 'application/octet-stream')}
            data = {'layer_height': '0.05', 'threshold': '0.1'}
            
            response = requests.post(
                f"{BASE_URL}/island-detection",
                files=files,
                data=data,
                timeout=30
            )
        
        if response.status_code == 200:
            result = response.json()
            print(f"{GREEN}✓ Island detection successful{RESET}")
            print(f"  Total islands: {result.get('total_islands', 0)}")
            print(f"  Risk level: {result.get('risk_level', 'unknown')}")
            print(f"  Total layers: {result.get('total_layers', 0)}")
            return True
        else:
            print(f"{RED}✗ Island detection failed: {response.status_code}{RESET}")
            print(f"  Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"{RED}✗ Island detection error: {e}{RESET}")
        return False
    finally:
        if os.path.exists(test_file):
            os.unlink(test_file)


def test_mesh_analyze():
    """Test mesh analysis endpoint"""
    print(f"\n{YELLOW}Testing Mesh Analysis...{RESET}")
    
    with tempfile.NamedTemporaryFile(suffix='.stl', delete=False) as f:
        test_file = create_test_model(f.name)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': ('test.stl', f, 'application/octet-stream')}
            
            response = requests.post(
                f"{BASE_URL}/mesh-analyze",
                files=files,
                timeout=30
            )
        
        if response.status_code == 200:
            result = response.json()
            print(f"{GREEN}✓ Mesh analysis successful{RESET}")
            print(f"  Is watertight: {result.get('is_watertight', False)}")
            print(f"  Is printable: {result.get('is_printable', False)}")
            print(f"  Quality score: {result.get('quality_score', 0)}")
            print(f"  Vertex count: {result.get('vertex_count', 0)}")
            return True
        else:
            print(f"{RED}✗ Mesh analysis failed: {response.status_code}{RESET}")
            print(f"  Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"{RED}✗ Mesh analysis error: {e}{RESET}")
        return False
    finally:
        if os.path.exists(test_file):
            os.unlink(test_file)


def test_mesh_repair():
    """Test mesh repair endpoint"""
    print(f"\n{YELLOW}Testing Mesh Repair...{RESET}")
    
    with tempfile.NamedTemporaryFile(suffix='.stl', delete=False) as f:
        test_file = create_test_model(f.name)
    
    output_file = None
    try:
        with open(test_file, 'rb') as f:
            files = {'file': ('test.stl', f, 'application/octet-stream')}
            
            response = requests.post(
                f"{BASE_URL}/mesh-repair",
                files=files,
                timeout=30
            )
        
        if response.status_code == 200:
            # Save repaired file temporarily
            output_file = tempfile.NamedTemporaryFile(suffix='.stl', delete=False).name
            with open(output_file, 'wb') as f:
                f.write(response.content)
            
            print(f"{GREEN}✓ Mesh repair successful{RESET}")
            print(f"  Repaired file size: {len(response.content)} bytes")
            return True
        else:
            print(f"{RED}✗ Mesh repair failed: {response.status_code}{RESET}")
            print(f"  Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"{RED}✗ Mesh repair error: {e}{RESET}")
        return False
    finally:
        if test_file and os.path.exists(test_file):
            os.unlink(test_file)
        if output_file and os.path.exists(output_file):
            os.unlink(output_file)


def test_hollow_estimate():
    """Test hollowing estimation endpoint"""
    print(f"\n{YELLOW}Testing Hollowing Estimation...{RESET}")
    
    with tempfile.NamedTemporaryFile(suffix='.stl', delete=False) as f:
        test_file = create_test_model(f.name)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': ('test.stl', f, 'application/octet-stream')}
            data = {
                'wall_thickness': '2.0',
                'estimate_only': 'true'
            }
            
            response = requests.post(
                f"{BASE_URL}/hollow",
                files=files,
                data=data,
                timeout=30
            )
        
        if response.status_code == 200:
            result = response.json()
            print(f"{GREEN}✓ Hollowing estimation successful{RESET}")
            print(f"  Volume saved: {result.get('estimated_volume_saved_mm3', 0)} mm³")
            print(f"  Weight saved: {result.get('estimated_weight_saved_g', 0)} g")
            print(f"  Savings: {result.get('estimated_savings_percent', 0)}%")
            
            cost_savings = result.get('estimated_cost_savings', {})
            print(f"  Cost saved: ${cost_savings.get('cost_saved_usd', 0)}")
            return True
        else:
            print(f"{RED}✗ Hollowing estimation failed: {response.status_code}{RESET}")
            print(f"  Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"{RED}✗ Hollowing estimation error: {e}{RESET}")
        return False
    finally:
        if os.path.exists(test_file):
            os.unlink(test_file)


def test_batch_analyze():
    """Test batch analysis endpoint"""
    print(f"\n{YELLOW}Testing Batch Analysis...{RESET}")
    
    # Create multiple test files
    test_files = []
    for i in range(3):
        with tempfile.NamedTemporaryFile(suffix='.stl', delete=False) as f:
            test_file = create_test_model(f.name)
            test_files.append(test_file)
    
    try:
        files = []
        for i, test_file in enumerate(test_files):
            files.append(('files', (f'test_{i}.stl', open(test_file, 'rb'), 'application/octet-stream')))
        
        response = requests.post(
            f"{BASE_URL}/batch/analyze",
            files=files,
            timeout=60
        )
        
        # Close all file handles
        for _, (_, fh, _) in files:
            fh.close()
        
        if response.status_code == 200:
            result = response.json()
            print(f"{GREEN}✓ Batch analysis successful{RESET}")
            print(f"  Total models: {result.get('total_models', 0)}")
            print(f"  Successful: {result.get('successful', 0)}")
            print(f"  Printable models: {result.get('printable_models', 0)}")
            return True
        else:
            print(f"{RED}✗ Batch analysis failed: {response.status_code}{RESET}")
            print(f"  Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"{RED}✗ Batch analysis error: {e}{RESET}")
        return False
    finally:
        for test_file in test_files:
            if os.path.exists(test_file):
                os.unlink(test_file)


def main():
    """Run all tests"""
    print(f"\n{'='*60}")
    print(f"SprueCrafter Advanced Features API Integration Tests")
    print(f"{'='*60}")
    
    print(f"\n{YELLOW}Note: Make sure the Flask backend is running on {BASE_URL}{RESET}")
    print(f"{YELLOW}Start it with: python src/backend/app.py{RESET}")
    
    time.sleep(2)
    
    results = {
        'Health Check': test_health(),
        'Island Detection': test_island_detection(),
        'Mesh Analysis': test_mesh_analyze(),
        'Mesh Repair': test_mesh_repair(),
        'Hollow Estimation': test_hollow_estimate(),
        'Batch Analysis': test_batch_analyze(),
    }
    
    # Summary
    print(f"\n{'='*60}")
    print(f"Test Summary")
    print(f"{'='*60}")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = f"{GREEN}✓ PASS{RESET}" if passed_test else f"{RED}✗ FAIL{RESET}"
        print(f"{test_name:.<40} {status}")
    
    print(f"\n{passed}/{total} tests passed")
    
    if passed == total:
        print(f"\n{GREEN}All tests passed! 🎉{RESET}")
        return 0
    else:
        print(f"\n{RED}Some tests failed. Please check the logs.{RESET}")
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
