"""
Batch Processing Module for SprueCrafter
Handle multiple models and operations in batch mode
"""

import trimesh
import os
from typing import Dict, List, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class BatchProcessor:
    """
    Provides batch processing functionality for multiple 3D models
    """

    def __init__(self):
        """
        Initialize batch processor
        """
        self.models = []
        self.results = []

    def load_models(self, file_paths: List[str]) -> Dict[str, any]:
        """
        Load multiple 3D model files

        Args:
            file_paths: List of file paths to load

        Returns:
            Dictionary containing load results
        """
        try:
            loaded = []
            failed = []

            # Allowed 3D file extensions
            allowed_extensions = {'.stl', '.obj', '.fbx', '.3ds', '.ply', '.gltf', '.glb', '.dae'}

            for file_path in file_paths:
                try:
                    # Validate file exists
                    if not os.path.exists(file_path):
                        failed.append({"path": file_path, "error": "File not found"})
                        continue

                    # Validate file extension
                    file_ext = os.path.splitext(file_path)[1].lower()
                    if file_ext not in allowed_extensions:
                        failed.append({"path": file_path, "error": f"Unsupported file type: {file_ext}"})
                        continue

                    # Validate file size (limit to 500MB)
                    file_size = os.path.getsize(file_path)
                    if file_size > 500 * 1024 * 1024:  # 500MB
                        failed.append({"path": file_path, "error": "File too large (max 500MB)"})
                        continue

                    # Load the mesh
                    mesh = trimesh.load(file_path)
                    loaded.append(
                        {
                            "path": file_path,
                            "filename": os.path.basename(file_path),
                            "mesh": mesh,
                            "vertex_count": len(mesh.vertices) if hasattr(mesh, 'vertices') else 0,
                            "face_count": len(mesh.faces) if hasattr(mesh, 'faces') else 0,
                        }
                    )
                except Exception as e:
                    failed.append({"path": file_path, "error": str(e)})

            self.models = loaded

            return {
                "success": True,
                "loaded": len(loaded),
                "failed": len(failed),
                "models": [
                    {
                        "filename": m["filename"],
                        "vertex_count": m["vertex_count"],
                        "face_count": m["face_count"],
                    }
                    for m in loaded
                ],
                "failures": failed,
            }

        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def batch_scale(self, scale_factor: float) -> Dict[str, any]:
        """
        Apply scaling to all loaded models

        Args:
            scale_factor: Scale factor to apply

        Returns:
            Dictionary containing scaling results
        """
        try:
            results = []

            for model_data in self.models:
                try:
                    mesh = model_data["mesh"]
                    original_bounds = mesh.bounds.copy()

                    # Apply scaling
                    mesh.apply_scale(scale_factor)

                    results.append(
                        {
                            "filename": model_data["filename"],
                            "success": True,
                            "scale_factor": scale_factor,
                            "original_size": (
                                original_bounds[1] - original_bounds[0]
                            ).tolist(),
                            "new_size": (mesh.bounds[1] - mesh.bounds[0]).tolist(),
                        }
                    )

                except Exception as e:
                    results.append(
                        {
                            "filename": model_data["filename"],
                            "success": False,
                            "error": str(e),
                        }
                    )

            successful = sum(1 for r in results if r["success"])

            return {
                "success": True,
                "total_models": len(self.models),
                "successful": successful,
                "failed": len(self.models) - successful,
                "results": results,
            }

        except Exception as e:
            logger.error(f"Error in batch scaling: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def batch_convert(
        self, output_format: str, output_directory: str
    ) -> Dict[str, any]:
        """
        Convert all loaded models to specified format

        Args:
            output_format: Target format (e.g., 'stl', 'obj')
            output_directory: Directory to save converted files

        Returns:
            Dictionary containing conversion results
        """
        try:
            os.makedirs(output_directory, exist_ok=True)
            results = []

            for model_data in self.models:
                try:
                    mesh = model_data["mesh"]
                    filename = model_data["filename"]

                    # Change extension
                    base_name = os.path.splitext(filename)[0]
                    output_filename = f"{base_name}.{output_format}"
                    output_path = os.path.join(output_directory, output_filename)

                    # Export
                    mesh.export(output_path)

                    results.append(
                        {
                            "filename": filename,
                            "success": True,
                            "output_file": output_filename,
                            "output_path": output_path,
                        }
                    )

                except Exception as e:
                    results.append(
                        {
                            "filename": model_data["filename"],
                            "success": False,
                            "error": str(e),
                        }
                    )

            successful = sum(1 for r in results if r["success"])

            return {
                "success": True,
                "total_models": len(self.models),
                "successful": successful,
                "failed": len(self.models) - successful,
                "output_format": output_format,
                "output_directory": output_directory,
                "results": results,
            }

        except Exception as e:
            logger.error(f"Error in batch conversion: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def batch_repair(self) -> Dict[str, any]:
        """
        Repair all loaded models

        Returns:
            Dictionary containing repair results
        """
        try:
            from .mesh_repair import MeshRepair

            results = []

            for model_data in self.models:
                try:
                    mesh = model_data["mesh"]
                    repairer = MeshRepair(mesh)

                    repair_result = repairer.one_click_repair()

                    results.append(
                        {
                            "filename": model_data["filename"],
                            "success": repair_result["success"],
                            "operations": repair_result.get("operations_performed", []),
                            "before_quality": repair_result.get("before", {}).get(
                                "quality_score", 0
                            ),
                            "after_quality": repair_result.get("after", {}).get(
                                "quality_score", 0
                            ),
                        }
                    )

                    # Update mesh with repaired version
                    if repair_result["success"]:
                        model_data["mesh"] = repairer.get_repaired_mesh()

                except Exception as e:
                    results.append(
                        {
                            "filename": model_data["filename"],
                            "success": False,
                            "error": str(e),
                        }
                    )

            successful = sum(1 for r in results if r["success"])

            return {
                "success": True,
                "total_models": len(self.models),
                "successful": successful,
                "failed": len(self.models) - successful,
                "results": results,
            }

        except Exception as e:
            logger.error(f"Error in batch repair: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def batch_hollow(
        self, wall_thickness: float = 2.0, drainage_holes: int = 2
    ) -> Dict[str, any]:
        """
        Hollow all loaded models

        Args:
            wall_thickness: Wall thickness for hollowing in mm
            drainage_holes: Number of drainage holes

        Returns:
            Dictionary containing hollowing results
        """
        try:
            from .hollowing import Hollowing

            results = []

            for model_data in self.models:
                try:
                    mesh = model_data["mesh"]
                    hollower = Hollowing(mesh)

                    hollow_result = hollower.hollow_model(
                        wall_thickness=wall_thickness,
                        drainage_hole_count=drainage_holes,
                    )

                    results.append(
                        {
                            "filename": model_data["filename"],
                            "success": hollow_result["success"],
                            "volume_saved_mm3": hollow_result.get(
                                "volume_saved_mm3", 0
                            ),
                            "weight_saved_g": hollow_result.get("weight_saved_g", 0),
                            "savings_percent": hollow_result.get("savings_percent", 0),
                        }
                    )

                    # Update mesh with hollowed version
                    if hollow_result["success"]:
                        hollowed_mesh = hollower.get_hollowed_mesh()
                        if hollowed_mesh is not None:
                            model_data["mesh"] = hollowed_mesh

                except Exception as e:
                    results.append(
                        {
                            "filename": model_data["filename"],
                            "success": False,
                            "error": str(e),
                        }
                    )

            successful = sum(1 for r in results if r["success"])
            total_savings = sum(r.get("volume_saved_mm3", 0) for r in results)

            return {
                "success": True,
                "total_models": len(self.models),
                "successful": successful,
                "failed": len(self.models) - successful,
                "total_volume_saved_mm3": round(total_savings, 2),
                "results": results,
            }

        except Exception as e:
            logger.error(f"Error in batch hollowing: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def batch_analyze(self) -> Dict[str, any]:
        """
        Analyze all loaded models for quality and issues

        Returns:
            Dictionary containing analysis results
        """
        try:
            from .mesh_repair import MeshRepair
            from .island_detector import IslandDetector

            results = []

            for model_data in self.models:
                try:
                    mesh = model_data["mesh"]

                    # Mesh quality analysis
                    repairer = MeshRepair(mesh)
                    quality_result = repairer.analyze_mesh()

                    # Island detection
                    detector = IslandDetector(mesh)
                    island_result = detector.detect_islands()

                    results.append(
                        {
                            "filename": model_data["filename"],
                            "success": True,
                            "is_watertight": quality_result.get("is_watertight", False),
                            "is_printable": quality_result.get("is_printable", False),
                            "quality_score": quality_result.get("quality_score", 0),
                            "total_islands": island_result.get("total_islands", 0),
                            "risk_level": island_result.get("risk_level", "unknown"),
                        }
                    )

                except Exception as e:
                    results.append(
                        {
                            "filename": model_data["filename"],
                            "success": False,
                            "error": str(e),
                        }
                    )

            successful = sum(1 for r in results if r["success"])
            printable = sum(1 for r in results if r.get("is_printable", False))

            return {
                "success": True,
                "total_models": len(self.models),
                "successful": successful,
                "failed": len(self.models) - successful,
                "printable_models": printable,
                "results": results,
            }

        except Exception as e:
            logger.error(f"Error in batch analysis: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def batch_export(self, output_directory: str) -> Dict[str, any]:
        """
        Export all processed models

        Args:
            output_directory: Directory to save exported files

        Returns:
            Dictionary containing export results
        """
        try:
            os.makedirs(output_directory, exist_ok=True)
            results = []

            for model_data in self.models:
                try:
                    mesh = model_data["mesh"]
                    filename = model_data["filename"]
                    output_path = os.path.join(output_directory, filename)

                    # Export
                    mesh.export(output_path)

                    results.append(
                        {
                            "filename": filename,
                            "success": True,
                            "output_path": output_path,
                        }
                    )

                except Exception as e:
                    results.append(
                        {
                            "filename": model_data["filename"],
                            "success": False,
                            "error": str(e),
                        }
                    )

            successful = sum(1 for r in results if r["success"])

            return {
                "success": True,
                "total_models": len(self.models),
                "successful": successful,
                "failed": len(self.models) - successful,
                "output_directory": output_directory,
                "results": results,
            }

        except Exception as e:
            logger.error(f"Error in batch export: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def get_models(self) -> List[Dict[str, any]]:
        """
        Get list of loaded models

        Returns:
            List of model information dictionaries
        """
        return [
            {
                "filename": m["filename"],
                "vertex_count": m["vertex_count"],
                "face_count": m["face_count"],
            }
            for m in self.models
        ]

    def clear_models(self):
        """
        Clear all loaded models
        """
        self.models = []
        self.results = []
