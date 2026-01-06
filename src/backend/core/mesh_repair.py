"""
Mesh Repair Module for SprueCrafter
One-click mesh repair and quality analysis tools
"""

import trimesh
import numpy as np
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class MeshRepair:
    """
    Provides mesh repair and quality analysis functionality
    """

    def __init__(self, mesh: trimesh.Trimesh):
        """
        Initialize mesh repair with a 3D mesh

        Args:
            mesh: Input trimesh object to repair
        """
        self.original_mesh = mesh.copy()
        self.mesh = mesh
        self.repair_history = []

    def analyze_mesh(self) -> Dict[str, any]:
        """
        Analyze mesh quality and identify issues

        Returns:
            Dictionary containing mesh quality metrics
        """
        try:
            issues = []
            warnings = []

            # Check if mesh is watertight
            is_watertight = self.mesh.is_watertight
            if not is_watertight:
                issues.append("Mesh is not watertight (has holes or gaps)")

            # Check for degenerate faces
            degenerate_faces = self._count_degenerate_faces()
            if degenerate_faces > 0:
                issues.append(f"Found {degenerate_faces} degenerate faces")

            # Check for duplicate vertices
            duplicate_vertices = self._count_duplicate_vertices()
            if duplicate_vertices > 0:
                warnings.append(f"Found {duplicate_vertices} duplicate vertices")

            # Check for non-manifold edges
            edges_info = self.mesh.edges_unique
            if hasattr(self.mesh, "edges_face_angle"):
                non_manifold = self._check_non_manifold_edges()
                if non_manifold > 0:
                    issues.append(f"Found {non_manifold} non-manifold edges")

            # Check mesh volume
            try:
                volume = abs(self.mesh.volume)
                if volume < 0.001:
                    warnings.append("Mesh has very small or zero volume")
            except:
                warnings.append("Could not calculate mesh volume")

            # Calculate overall quality score
            quality_score = self._calculate_quality_score(
                is_watertight, degenerate_faces, duplicate_vertices
            )

            return {
                "success": True,
                "is_watertight": is_watertight,
                "is_manifold": len(issues) == 0,
                "vertex_count": len(self.mesh.vertices),
                "face_count": len(self.mesh.faces),
                "edge_count": len(self.mesh.edges),
                "degenerate_faces": degenerate_faces,
                "duplicate_vertices": duplicate_vertices,
                "bounding_box": self.mesh.bounds.tolist(),
                "volume": float(abs(self.mesh.volume)) if hasattr(self.mesh, "volume") else 0,
                "surface_area": float(self.mesh.area) if hasattr(self.mesh, "area") else 0,
                "quality_score": quality_score,
                "issues": issues,
                "warnings": warnings,
                "is_printable": is_watertight and len(issues) == 0,
            }

        except Exception as e:
            logger.error(f"Error analyzing mesh: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "is_printable": False,
            }

    def one_click_repair(self) -> Dict[str, any]:
        """
        Perform automatic one-click mesh repair

        Returns:
            Dictionary containing repair results
        """
        try:
            operations_performed = []

            # Store original stats
            original_analysis = self.analyze_mesh()

            # 1. Remove duplicate vertices
            if original_analysis.get("duplicate_vertices", 0) > 0:
                self.mesh.merge_vertices()
                operations_performed.append("Removed duplicate vertices")

            # 2. Remove degenerate faces
            if original_analysis.get("degenerate_faces", 0) > 0:
                self.mesh.remove_degenerate_faces()
                operations_performed.append("Removed degenerate faces")

            # 3. Fill holes (if not watertight)
            if not original_analysis.get("is_watertight", False):
                filled = self._fill_holes()
                if filled:
                    operations_performed.append("Filled mesh holes")

            # 4. Fix normals
            self.mesh.fix_normals()
            operations_performed.append("Fixed face normals")

            # 5. Remove unreferenced vertices
            self.mesh.remove_unreferenced_vertices()
            operations_performed.append("Cleaned unreferenced vertices")

            # Analyze repaired mesh
            final_analysis = self.analyze_mesh()

            # Track repair history
            self.repair_history.append(
                {
                    "operations": operations_performed,
                    "before": original_analysis,
                    "after": final_analysis,
                }
            )

            return {
                "success": True,
                "operations_performed": operations_performed,
                "before": {
                    "is_watertight": original_analysis.get("is_watertight", False),
                    "vertex_count": original_analysis.get("vertex_count", 0),
                    "face_count": original_analysis.get("face_count", 0),
                    "quality_score": original_analysis.get("quality_score", 0),
                },
                "after": {
                    "is_watertight": final_analysis.get("is_watertight", False),
                    "vertex_count": final_analysis.get("vertex_count", 0),
                    "face_count": final_analysis.get("face_count", 0),
                    "quality_score": final_analysis.get("quality_score", 0),
                },
                "is_printable": final_analysis.get("is_printable", False),
                "improvement": final_analysis.get("quality_score", 0)
                - original_analysis.get("quality_score", 0),
            }

        except Exception as e:
            logger.error(f"Error repairing mesh: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "operations_performed": operations_performed,
            }

    def fill_holes(self) -> Dict[str, any]:
        """
        Fill holes in the mesh

        Returns:
            Dictionary containing fill results
        """
        try:
            filled = self._fill_holes()

            return {
                "success": True,
                "holes_filled": filled,
                "is_watertight": self.mesh.is_watertight,
            }

        except Exception as e:
            logger.error(f"Error filling holes: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def _fill_holes(self) -> int:
        """
        Internal method to fill holes in the mesh

        Returns:
            Number of holes filled
        """
        try:
            # Trimesh can attempt to fill holes
            initial_watertight = self.mesh.is_watertight

            if not initial_watertight:
                # Try to fill small holes
                self.mesh.fill_holes()

                # Check if now watertight
                if self.mesh.is_watertight:
                    return 1

            return 0

        except Exception as e:
            logger.warning(f"Could not fill holes: {str(e)}")
            return 0

    def fix_normals(self) -> Dict[str, any]:
        """
        Fix face normals to point outward

        Returns:
            Dictionary containing fix results
        """
        try:
            self.mesh.fix_normals()

            return {
                "success": True,
                "message": "Face normals fixed",
            }

        except Exception as e:
            logger.error(f"Error fixing normals: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def remove_duplicates(self) -> Dict[str, any]:
        """
        Remove duplicate vertices and faces

        Returns:
            Dictionary containing removal results
        """
        try:
            before_vertices = len(self.mesh.vertices)
            before_faces = len(self.mesh.faces)

            self.mesh.merge_vertices()
            self.mesh.remove_duplicate_faces()

            after_vertices = len(self.mesh.vertices)
            after_faces = len(self.mesh.faces)

            return {
                "success": True,
                "vertices_removed": before_vertices - after_vertices,
                "faces_removed": before_faces - after_faces,
            }

        except Exception as e:
            logger.error(f"Error removing duplicates: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def simplify_mesh(self, target_faces: Optional[int] = None) -> Dict[str, any]:
        """
        Simplify mesh by reducing polygon count

        Args:
            target_faces: Target number of faces (if None, reduces by 50%)

        Returns:
            Dictionary containing simplification results
        """
        try:
            original_faces = len(self.mesh.faces)

            if target_faces is None:
                target_faces = original_faces // 2

            # Use trimesh simplification
            simplified = self.mesh.simplify_quadric_decimation(target_faces)

            if simplified is not None:
                self.mesh = simplified

            final_faces = len(self.mesh.faces)

            return {
                "success": True,
                "original_faces": original_faces,
                "final_faces": final_faces,
                "reduction_percent": round((1 - final_faces / original_faces) * 100, 1),
            }

        except Exception as e:
            logger.error(f"Error simplifying mesh: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def verify_watertight(self) -> Dict[str, any]:
        """
        Verify if mesh is watertight and printable

        Returns:
            Dictionary containing verification results
        """
        try:
            is_watertight = self.mesh.is_watertight

            # Additional checks
            checks = {
                "is_watertight": is_watertight,
                "has_volume": abs(self.mesh.volume) > 0.001,
                "has_faces": len(self.mesh.faces) > 0,
                "has_vertices": len(self.mesh.vertices) > 0,
            }

            all_passed = all(checks.values())

            return {
                "success": True,
                "is_watertight": is_watertight,
                "is_printable": all_passed,
                "checks": checks,
                "message": "Mesh is printable"
                if all_passed
                else "Mesh has issues that may affect printing",
            }

        except Exception as e:
            logger.error(f"Error verifying mesh: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def _count_degenerate_faces(self) -> int:
        """
        Count degenerate faces (faces with zero area)

        Returns:
            Number of degenerate faces
        """
        try:
            # Get face areas
            areas = self.mesh.area_faces
            # Count faces with near-zero area
            degenerate = np.sum(areas < 1e-8)
            return int(degenerate)
        except (AttributeError, ValueError, TypeError) as e:
            logger.debug(f"Could not count degenerate faces: {e}")
            return 0

    def _count_duplicate_vertices(self) -> int:
        """
        Count duplicate vertices

        Returns:
            Number of duplicate vertices
        """
        try:
            unique_vertices = np.unique(
                self.mesh.vertices.view(
                    np.dtype((np.void, self.mesh.vertices.dtype.itemsize * 3))
                )
            )
            return len(self.mesh.vertices) - len(unique_vertices)
        except (AttributeError, ValueError, TypeError) as e:
            logger.debug(f"Could not count duplicate vertices: {e}")
            return 0

    def _check_non_manifold_edges(self) -> int:
        """
        Check for non-manifold edges

        Returns:
            Number of non-manifold edges
        """
        try:
            # This is a simplified check
            # Trimesh has built-in methods to check this
            if hasattr(self.mesh, "edges_unique_length"):
                # Non-manifold edges are edges shared by more than 2 faces
                edge_count = {}
                for face in self.mesh.faces:
                    edges = [
                        tuple(sorted([face[0], face[1]])),
                        tuple(sorted([face[1], face[2]])),
                        tuple(sorted([face[2], face[0]])),
                    ]
                    for edge in edges:
                        edge_count[edge] = edge_count.get(edge, 0) + 1

                non_manifold = sum(1 for count in edge_count.values() if count > 2)
                return non_manifold
        except:
            pass
        return 0

    def _calculate_quality_score(
        self, is_watertight: bool, degenerate_faces: int, duplicate_vertices: int
    ) -> float:
        """
        Calculate overall mesh quality score (0-100)

        Args:
            is_watertight: Whether mesh is watertight
            degenerate_faces: Number of degenerate faces
            duplicate_vertices: Number of duplicate vertices

        Returns:
            Quality score from 0 to 100
        """
        score = 100.0

        if not is_watertight:
            score -= 40

        # Penalize for degenerate faces
        score -= min(degenerate_faces * 2, 20)

        # Small penalty for duplicate vertices
        score -= min(duplicate_vertices * 0.1, 10)

        return max(0, round(score, 1))

    def get_repaired_mesh(self) -> trimesh.Trimesh:
        """
        Get the repaired mesh

        Returns:
            Repaired trimesh object
        """
        return self.mesh
