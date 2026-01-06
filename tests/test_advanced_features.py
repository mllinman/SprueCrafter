"""
Unit tests for advanced features in SprueCrafter
Tests for Island Detection, Mesh Repair, Hollowing, and Batch Processing
"""

import unittest
import sys
import os
import tempfile
import numpy as np

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'backend'))

import trimesh
from core.island_detector import IslandDetector
from core.mesh_repair import MeshRepair
from core.hollowing import Hollowing
from core.batch_processor import BatchProcessor


class TestIslandDetector(unittest.TestCase):
    """Test cases for Island Detection"""

    def setUp(self):
        """Create a simple test mesh"""
        # Create a simple cube mesh
        self.mesh = trimesh.creation.box(extents=[10, 10, 10])

    def test_detect_islands_no_islands(self):
        """Test island detection on a solid cube (should have no islands)"""
        detector = IslandDetector(self.mesh)
        result = detector.detect_islands(layer_height=0.5)

        self.assertTrue(result["success"])
        self.assertEqual(result["total_islands"], 0)
        self.assertEqual(result["risk_level"], "low")

    def test_detect_islands_initialization(self):
        """Test island detector initialization"""
        detector = IslandDetector(self.mesh)
        self.assertIsNotNone(detector.mesh)
        self.assertEqual(detector.layer_height, 0.05)

    def test_calculate_risk_level(self):
        """Test risk level calculation"""
        detector = IslandDetector(self.mesh)
        
        # Test low risk
        risk = detector._calculate_risk_level(0, 100, 0)
        self.assertEqual(risk, "low")
        
        # Test medium risk
        risk = detector._calculate_risk_level(5, 100, 5)
        self.assertEqual(risk, "medium")
        
        # Test high risk
        risk = detector._calculate_risk_level(15, 100, 20)
        self.assertEqual(risk, "high")
        
        # Test critical risk
        risk = detector._calculate_risk_level(25, 100, 40)
        self.assertEqual(risk, "critical")


class TestMeshRepair(unittest.TestCase):
    """Test cases for Mesh Repair"""

    def setUp(self):
        """Create a test mesh"""
        self.mesh = trimesh.creation.box(extents=[10, 10, 10])

    def test_analyze_mesh_clean(self):
        """Test analysis of a clean mesh"""
        repairer = MeshRepair(self.mesh)
        result = repairer.analyze_mesh()

        self.assertTrue(result["success"])
        self.assertTrue(result["is_watertight"])
        self.assertGreater(result["quality_score"], 90)
        self.assertTrue(result["is_printable"])

    def test_one_click_repair(self):
        """Test one-click repair on a clean mesh"""
        repairer = MeshRepair(self.mesh)
        result = repairer.one_click_repair()

        self.assertTrue(result["success"])
        self.assertIsInstance(result["operations_performed"], list)

    def test_verify_watertight(self):
        """Test watertight verification"""
        repairer = MeshRepair(self.mesh)
        result = repairer.verify_watertight()

        self.assertTrue(result["success"])
        self.assertTrue(result["is_watertight"])
        self.assertTrue(result["is_printable"])

    def test_quality_score_calculation(self):
        """Test quality score calculation"""
        repairer = MeshRepair(self.mesh)
        
        # Perfect mesh
        score = repairer._calculate_quality_score(True, 0, 0)
        self.assertEqual(score, 100.0)
        
        # Mesh with issues
        score = repairer._calculate_quality_score(False, 5, 10)
        self.assertLess(score, 100.0)


class TestHollowing(unittest.TestCase):
    """Test cases for Hollowing"""

    def setUp(self):
        """Create a test mesh"""
        self.mesh = trimesh.creation.box(extents=[20, 20, 20])

    def test_estimate_savings(self):
        """Test material savings estimation"""
        hollower = Hollowing(self.mesh)
        result = hollower.estimate_savings(wall_thickness=2.0)

        self.assertTrue(result["success"])
        self.assertGreater(result["estimated_volume_saved_mm3"], 0)
        self.assertGreater(result["estimated_savings_percent"], 0)
        self.assertIn("estimated_cost_savings", result)

    def test_hollow_model(self):
        """Test basic hollowing"""
        hollower = Hollowing(self.mesh)
        result = hollower.hollow_model(wall_thickness=2.0, drainage_hole_count=0)

        self.assertTrue(result["success"])
        self.assertIn("volume_saved_mm3", result)
        self.assertIn("weight_saved_g", result)
        self.assertIn("savings_percent", result)

    def test_calculate_weight(self):
        """Test weight calculation"""
        hollower = Hollowing(self.mesh)
        
        # Test with default density
        weight = hollower._calculate_weight(1000.0)  # 1000 mm³
        self.assertGreater(weight, 0)
        self.assertEqual(weight, 1.2)  # 1 cm³ * 1.2 g/cm³

    def test_cost_savings_calculation(self):
        """Test cost savings calculation"""
        hollower = Hollowing(self.mesh)
        
        savings = hollower._calculate_cost_savings(10000.0)  # 10000 mm³
        self.assertIn("volume_saved_ml", savings)
        self.assertIn("cost_saved_usd", savings)
        self.assertEqual(savings["volume_saved_ml"], 10.0)


class TestBatchProcessor(unittest.TestCase):
    """Test cases for Batch Processing"""

    def setUp(self):
        """Create test files"""
        self.temp_dir = tempfile.mkdtemp()
        
        # Create test STL files
        self.test_files = []
        for i in range(3):
            mesh = trimesh.creation.box(extents=[10, 10, 10])
            filepath = os.path.join(self.temp_dir, f"test_model_{i}.stl")
            mesh.export(filepath)
            self.test_files.append(filepath)

    def tearDown(self):
        """Clean up test files"""
        import shutil
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)

    def test_load_models(self):
        """Test loading multiple models"""
        processor = BatchProcessor()
        result = processor.load_models(self.test_files)

        self.assertTrue(result["success"])
        self.assertEqual(result["loaded"], 3)
        self.assertEqual(result["failed"], 0)

    def test_batch_scale(self):
        """Test batch scaling"""
        processor = BatchProcessor()
        processor.load_models(self.test_files)
        
        result = processor.batch_scale(scale_factor=2.0)

        self.assertTrue(result["success"])
        self.assertEqual(result["successful"], 3)

    def test_get_models(self):
        """Test getting loaded models list"""
        processor = BatchProcessor()
        processor.load_models(self.test_files)
        
        models = processor.get_models()
        self.assertEqual(len(models), 3)
        self.assertIn("filename", models[0])

    def test_clear_models(self):
        """Test clearing loaded models"""
        processor = BatchProcessor()
        processor.load_models(self.test_files)
        
        self.assertEqual(len(processor.models), 3)
        processor.clear_models()
        self.assertEqual(len(processor.models), 0)


class TestIntegration(unittest.TestCase):
    """Integration tests for advanced features"""

    def setUp(self):
        """Create test mesh and temporary directory"""
        self.mesh = trimesh.creation.box(extents=[20, 20, 20])
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        """Clean up"""
        import shutil
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)

    def test_repair_then_analyze(self):
        """Test repairing a mesh and then analyzing it"""
        # First repair
        repairer = MeshRepair(self.mesh)
        repair_result = repairer.one_click_repair()
        self.assertTrue(repair_result["success"])
        
        # Then analyze
        repaired_mesh = repairer.get_repaired_mesh()
        analyzer = MeshRepair(repaired_mesh)
        analysis_result = analyzer.analyze_mesh()
        
        self.assertTrue(analysis_result["success"])
        self.assertTrue(analysis_result["is_printable"])

    def test_hollow_with_analysis(self):
        """Test hollowing with before/after analysis"""
        # Analyze original
        repairer1 = MeshRepair(self.mesh)
        original_analysis = repairer1.analyze_mesh()
        original_volume = original_analysis["volume"]
        
        # Hollow
        hollower = Hollowing(self.mesh)
        hollow_result = hollower.hollow_model(wall_thickness=2.0, drainage_hole_count=0)
        
        self.assertTrue(hollow_result["success"])
        self.assertLess(
            hollow_result["hollowed_volume_mm3"],
            hollow_result["original_volume_mm3"]
        )


def run_tests():
    """Run all tests"""
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add all test classes
    suite.addTests(loader.loadTestsFromTestCase(TestIslandDetector))
    suite.addTests(loader.loadTestsFromTestCase(TestMeshRepair))
    suite.addTests(loader.loadTestsFromTestCase(TestHollowing))
    suite.addTests(loader.loadTestsFromTestCase(TestBatchProcessor))
    suite.addTests(loader.loadTestsFromTestCase(TestIntegration))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
