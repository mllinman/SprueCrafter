"""
Island Detection Module for SprueCrafter
Detects floating layers and potential print failure points in 3D models
"""

import trimesh
import numpy as np
from typing import List, Dict, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class IslandDetector:
    """
    Detects and analyzes islands (floating layers) in 3D models that may cause print failures
    """

    def __init__(self, mesh: trimesh.Trimesh):
        """
        Initialize island detector with a 3D mesh

        Args:
            mesh: Input trimesh object to analyze
        """
        self.mesh = mesh
        self.islands = []
        self.layer_height = 0.05  # Default layer height in mm

    def detect_islands(
        self, layer_height: float = 0.05, threshold: float = 0.1
    ) -> Dict[str, any]:
        """
        Detect islands by analyzing each layer of the model

        Args:
            layer_height: Height of each print layer in mm
            threshold: Minimum area threshold for island detection (mm²)

        Returns:
            Dictionary containing island detection results
        """
        try:
            self.layer_height = layer_height

            # Get model bounds
            bounds = self.mesh.bounds
            min_z = bounds[0][2]
            max_z = bounds[1][2]

            # Calculate number of layers
            num_layers = int((max_z - min_z) / layer_height) + 1

            islands_found = []
            layer_analysis = []

            # Analyze each layer
            for i in range(num_layers):
                z_height = min_z + (i * layer_height)
                layer_data = self._analyze_layer(z_height, threshold)

                if layer_data["has_islands"]:
                    islands_found.extend(layer_data["islands"])

                layer_analysis.append(
                    {
                        "layer": i,
                        "z_height": round(z_height, 3),
                        "has_islands": layer_data["has_islands"],
                        "island_count": layer_data["island_count"],
                        "connected_regions": layer_data["connected_regions"],
                    }
                )

            # Generate summary statistics
            total_islands = len(islands_found)
            problematic_layers = sum(1 for l in layer_analysis if l["has_islands"])

            result = {
                "success": True,
                "total_islands": total_islands,
                "problematic_layers": problematic_layers,
                "total_layers": num_layers,
                "layer_height": layer_height,
                "islands": islands_found,
                "layer_analysis": layer_analysis[:50],  # Limit for API response size
                "recommendations": self._generate_recommendations(total_islands),
                "risk_level": self._calculate_risk_level(
                    total_islands, num_layers, problematic_layers
                ),
            }

            self.islands = islands_found
            return result

        except Exception as e:
            logger.error(f"Error detecting islands: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "total_islands": 0,
                "problematic_layers": 0,
            }

    def _analyze_layer(self, z_height: float, threshold: float) -> Dict[str, any]:
        """
        Analyze a single layer for islands

        Args:
            z_height: Z-coordinate of the layer to analyze
            threshold: Minimum area threshold for island detection

        Returns:
            Dictionary with layer analysis results
        """
        try:
            # Create a plane at the given height
            plane_origin = [0, 0, z_height]
            plane_normal = [0, 0, 1]

            # Slice the mesh at this height
            slice_result = self.mesh.section(
                plane_origin=plane_origin, plane_normal=plane_normal
            )

            if slice_result is None:
                return {
                    "has_islands": False,
                    "island_count": 0,
                    "islands": [],
                    "connected_regions": 0,
                }

            # Get 2D paths from the slice
            paths, _ = slice_result.to_planar()

            if paths is None or len(paths.entities) == 0:
                return {
                    "has_islands": False,
                    "island_count": 0,
                    "islands": [],
                    "connected_regions": 0,
                }

            # Count connected regions
            num_regions = len(paths.entities)

            # Consider it an island if there are multiple disconnected regions
            # and some are small (below threshold area)
            islands = []
            if num_regions > 1:
                for idx, entity in enumerate(paths.entities):
                    # Get vertices for this path entity
                    vertices = paths.vertices[entity.points]
                    area = self._calculate_polygon_area(vertices)

                    # If area is small, it's likely an island
                    if area < threshold and area > 0.001:  # Ignore very tiny artifacts
                        islands.append(
                            {
                                "layer_z": round(z_height, 3),
                                "area": round(area, 4),
                                "region_id": idx,
                                "vertices": len(entity.points),
                            }
                        )

            return {
                "has_islands": len(islands) > 0,
                "island_count": len(islands),
                "islands": islands,
                "connected_regions": num_regions,
            }

        except Exception as e:
            logger.warning(f"Error analyzing layer at z={z_height}: {str(e)}")
            return {
                "has_islands": False,
                "island_count": 0,
                "islands": [],
                "connected_regions": 0,
            }

    def _calculate_polygon_area(self, vertices: np.ndarray) -> float:
        """
        Calculate area of a 2D polygon using the shoelace formula

        Args:
            vertices: Array of 2D vertices

        Returns:
            Area of the polygon in mm²
        """
        if len(vertices) < 3:
            return 0.0

        # Extract x and y coordinates
        x = vertices[:, 0]
        y = vertices[:, 1]

        # Shoelace formula
        area = 0.5 * abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1)))
        return area

    def _generate_recommendations(self, total_islands: int) -> List[str]:
        """
        Generate recommendations based on island detection results

        Args:
            total_islands: Total number of islands found

        Returns:
            List of recommendation strings
        """
        recommendations = []

        if total_islands == 0:
            recommendations.append("No islands detected. Model appears safe to print.")
        elif total_islands < 5:
            recommendations.append(
                "Few islands detected. Consider adding supports to affected areas."
            )
            recommendations.append(
                "Review island locations and adjust model orientation if possible."
            )
        else:
            recommendations.append(
                "Multiple islands detected. This model has high failure risk."
            )
            recommendations.append(
                "Consider rotating the model to reduce unsupported overhangs."
            )
            recommendations.append("Add supports to all detected island areas.")
            recommendations.append(
                "Review layer-by-layer analysis to identify problematic regions."
            )

        return recommendations

    def _calculate_risk_level(
        self, total_islands: int, total_layers: int, problematic_layers: int
    ) -> str:
        """
        Calculate print failure risk level

        Args:
            total_islands: Total number of islands detected
            total_layers: Total number of layers in the model
            problematic_layers: Number of layers with islands

        Returns:
            Risk level string: 'low', 'medium', 'high', or 'critical'
        """
        if total_islands == 0:
            return "low"

        # Calculate percentage of problematic layers
        problem_ratio = problematic_layers / max(total_layers, 1)

        if total_islands >= 20 or problem_ratio > 0.3:
            return "critical"
        elif total_islands >= 10 or problem_ratio > 0.15:
            return "high"
        elif total_islands >= 5 or problem_ratio > 0.05:
            return "medium"
        else:
            return "low"

    def get_island_positions(self) -> List[Tuple[float, float, float]]:
        """
        Get 3D positions of detected islands for visualization

        Returns:
            List of (x, y, z) tuples representing island centers
        """
        positions = []
        for island in self.islands:
            # Use layer z-height as z coordinate
            # For x and y, we'd need to calculate centroid (simplified here)
            z = island["layer_z"]
            positions.append((0, 0, z))  # Placeholder; enhance with actual centroids

        return positions

    def highlight_islands(self) -> Optional[trimesh.Trimesh]:
        """
        Create a visual representation of islands for 3D viewer

        Returns:
            Trimesh object with island markers, or None if no islands
        """
        if not self.islands:
            return None

        try:
            # Create sphere markers at island positions
            markers = []
            for island in self.islands:
                z = island["layer_z"]
                # Create a small sphere at the island location
                sphere = trimesh.creation.icosphere(radius=0.5)
                sphere.apply_translation([0, 0, z])
                markers.append(sphere)

            if markers:
                # Combine all markers into one mesh
                combined = trimesh.util.concatenate(markers)
                combined.visual.vertex_colors = [255, 0, 0, 200]  # Red, semi-transparent
                return combined

        except Exception as e:
            logger.error(f"Error creating island highlights: {str(e)}")

        return None
