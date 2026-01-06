"""
Hollowing Module for SprueCrafter
Advanced hollowing tools with drainage holes and material savings calculation
"""

import trimesh
import numpy as np
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class Hollowing:
    """
    Provides advanced hollowing functionality for 3D models
    """

    def __init__(self, mesh: trimesh.Trimesh):
        """
        Initialize hollowing with a 3D mesh

        Args:
            mesh: Input trimesh object to hollow
        """
        self.mesh = mesh
        self.hollowed_mesh = None
        self.drainage_holes = []

    def hollow_model(
        self,
        wall_thickness: float = 2.0,
        drainage_hole_diameter: float = 3.0,
        drainage_hole_count: int = 2,
    ) -> Dict[str, any]:
        """
        Hollow out the model with specified wall thickness

        Args:
            wall_thickness: Thickness of the walls in mm
            drainage_hole_diameter: Diameter of drainage holes in mm
            drainage_hole_count: Number of drainage holes to create

        Returns:
            Dictionary containing hollowing results
        """
        try:
            # Calculate original volume and weight
            original_volume = abs(self.mesh.volume)
            original_weight = self._calculate_weight(original_volume)

            # Create hollowed version by scaling inner mesh
            scale_factor = self._calculate_inner_scale(wall_thickness)

            # Create inner mesh (scaled down)
            inner_mesh = self.mesh.copy()
            inner_mesh.apply_scale(scale_factor)

            # Center the inner mesh to match outer mesh
            inner_center = inner_mesh.bounds.mean(axis=0)
            outer_center = self.mesh.bounds.mean(axis=0)
            translation = outer_center - inner_center
            inner_mesh.apply_translation(translation)

            # Invert inner mesh normals (so it subtracts from outer)
            inner_mesh.invert()

            # Combine meshes (this creates the hollow shell)
            try:
                # Use boolean difference if available
                self.hollowed_mesh = self.mesh.difference(inner_mesh)
            except:
                # Fallback: just concatenate the meshes
                logger.warning("Boolean operation not available, using concatenation")
                self.hollowed_mesh = trimesh.util.concatenate([self.mesh, inner_mesh])

            # Add drainage holes
            if drainage_hole_count > 0:
                self._add_drainage_holes(drainage_hole_diameter, drainage_hole_count)

            # Calculate hollowed volume and savings
            hollowed_volume = abs(self.hollowed_mesh.volume)
            hollowed_weight = self._calculate_weight(hollowed_volume)

            volume_saved = original_volume - hollowed_volume
            weight_saved = original_weight - hollowed_weight
            savings_percent = (volume_saved / original_volume) * 100 if original_volume > 0 else 0

            return {
                "success": True,
                "wall_thickness": wall_thickness,
                "original_volume_mm3": round(original_volume, 2),
                "hollowed_volume_mm3": round(hollowed_volume, 2),
                "volume_saved_mm3": round(volume_saved, 2),
                "original_weight_g": round(original_weight, 2),
                "hollowed_weight_g": round(hollowed_weight, 2),
                "weight_saved_g": round(weight_saved, 2),
                "savings_percent": round(savings_percent, 1),
                "drainage_holes": len(self.drainage_holes),
                "drainage_hole_positions": self.drainage_holes,
                "estimated_cost_savings": self._calculate_cost_savings(volume_saved),
            }

        except Exception as e:
            logger.error(f"Error hollowing model: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def hollow_with_lattice(
        self, wall_thickness: float = 2.0, lattice_type: str = "honeycomb"
    ) -> Dict[str, any]:
        """
        Hollow model with internal lattice structure

        Args:
            wall_thickness: Thickness of outer walls in mm
            lattice_type: Type of lattice ('honeycomb', 'cubic', 'bcc')

        Returns:
            Dictionary containing hollowing results with lattice
        """
        try:
            # First hollow the model
            hollow_result = self.hollow_model(wall_thickness, 0, 0)

            if not hollow_result["success"]:
                return hollow_result

            # Create lattice structure (simplified version)
            lattice_mesh = self._create_lattice_structure(lattice_type)

            if lattice_mesh is not None:
                # Combine hollowed mesh with lattice
                self.hollowed_mesh = trimesh.util.concatenate(
                    [self.hollowed_mesh, lattice_mesh]
                )
                hollow_result["lattice_type"] = lattice_type
                hollow_result["has_lattice"] = True
            else:
                hollow_result["has_lattice"] = False

            return hollow_result

        except Exception as e:
            logger.error(f"Error creating lattice: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def add_drainage_holes(
        self, diameter: float = 3.0, count: int = 2
    ) -> Dict[str, any]:
        """
        Add drainage holes to existing hollowed model

        Args:
            diameter: Diameter of drainage holes in mm
            count: Number of holes to create

        Returns:
            Dictionary containing drainage hole results
        """
        try:
            if self.hollowed_mesh is None:
                return {
                    "success": False,
                    "error": "Model must be hollowed before adding drainage holes",
                }

            self._add_drainage_holes(diameter, count)

            return {
                "success": True,
                "drainage_holes_added": len(self.drainage_holes),
                "hole_diameter": diameter,
                "hole_positions": self.drainage_holes,
            }

        except Exception as e:
            logger.error(f"Error adding drainage holes: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def estimate_savings(
        self, wall_thickness: float = 2.0
    ) -> Dict[str, any]:
        """
        Estimate material and cost savings without actually hollowing

        Args:
            wall_thickness: Proposed wall thickness in mm

        Returns:
            Dictionary containing savings estimates
        """
        try:
            original_volume = abs(self.mesh.volume)

            # Estimate hollowed volume based on wall thickness
            scale_factor = self._calculate_inner_scale(wall_thickness)
            estimated_inner_volume = original_volume * (scale_factor ** 3)
            estimated_hollow_volume = original_volume - estimated_inner_volume

            volume_saved = original_volume - estimated_hollow_volume
            weight_saved = self._calculate_weight(volume_saved)
            savings_percent = (volume_saved / original_volume) * 100 if original_volume > 0 else 0

            return {
                "success": True,
                "wall_thickness": wall_thickness,
                "original_volume_mm3": round(original_volume, 2),
                "estimated_hollow_volume_mm3": round(estimated_hollow_volume, 2),
                "estimated_volume_saved_mm3": round(volume_saved, 2),
                "estimated_weight_saved_g": round(weight_saved, 2),
                "estimated_savings_percent": round(savings_percent, 1),
                "estimated_cost_savings": self._calculate_cost_savings(volume_saved),
            }

        except Exception as e:
            logger.error(f"Error estimating savings: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def _calculate_inner_scale(self, wall_thickness: float) -> float:
        """
        Calculate scale factor for inner mesh based on wall thickness

        Args:
            wall_thickness: Desired wall thickness in mm

        Returns:
            Scale factor for inner mesh
        """
        # Get bounding box dimensions
        bounds = self.mesh.bounds
        dimensions = bounds[1] - bounds[0]
        max_dimension = max(dimensions)

        # Calculate scale factor to achieve desired wall thickness
        # This is a simplified calculation
        scale_factor = 1.0 - (2 * wall_thickness / max_dimension)
        scale_factor = max(0.1, min(scale_factor, 0.95))  # Clamp between 0.1 and 0.95

        return scale_factor

    def _add_drainage_holes(self, diameter: float, count: int):
        """
        Add drainage holes to the hollowed mesh

        Args:
            diameter: Diameter of holes in mm
            count: Number of holes to create
        """
        try:
            # Find lowest points on the mesh for drainage
            vertices = self.hollowed_mesh.vertices
            z_values = vertices[:, 2]

            # Sort vertices by z-coordinate
            sorted_indices = np.argsort(z_values)

            # Select positions for drainage holes (at lowest points)
            hole_positions = []
            step = max(1, len(sorted_indices) // (count * 2))

            for i in range(count):
                idx = sorted_indices[i * step]
                position = vertices[idx]
                hole_positions.append(position.tolist())

                # Create a cylinder for the hole (subtract from mesh)
                hole_cylinder = trimesh.creation.cylinder(
                    radius=diameter / 2, height=10.0  # Height through the wall
                )

                # Position the cylinder at the hole location
                hole_cylinder.apply_translation(position)

                # Subtract hole from mesh (if boolean operations available)
                try:
                    self.hollowed_mesh = self.hollowed_mesh.difference(hole_cylinder)
                except:
                    logger.warning(f"Could not create hole at position {position}")

            self.drainage_holes = hole_positions

        except Exception as e:
            logger.warning(f"Error adding drainage holes: {str(e)}")

    def _create_lattice_structure(self, lattice_type: str) -> Optional[trimesh.Trimesh]:
        """
        Create internal lattice structure

        Args:
            lattice_type: Type of lattice to create

        Returns:
            Trimesh object with lattice structure, or None
        """
        try:
            # Get mesh bounds
            bounds = self.mesh.bounds
            dimensions = bounds[1] - bounds[0]

            # Create simple lattice (this is a simplified version)
            # In a full implementation, this would create complex internal structures

            if lattice_type == "honeycomb":
                # Create hexagonal pattern (simplified as cylinders)
                spacing = 5.0  # mm
                radius = 0.5  # mm

                cylinders = []
                x_range = np.arange(bounds[0][0], bounds[1][0], spacing)
                y_range = np.arange(bounds[0][1], bounds[1][1], spacing)

                for x in x_range[::2]:  # Sample to avoid too many cylinders
                    for y in y_range[::2]:
                        cyl = trimesh.creation.cylinder(
                            radius=radius, height=dimensions[2]
                        )
                        cyl.apply_translation([x, y, bounds[0][2]])
                        cylinders.append(cyl)

                if cylinders:
                    return trimesh.util.concatenate(cylinders)

            elif lattice_type == "cubic":
                # Create cubic grid pattern
                # Similar implementation as honeycomb but with different spacing
                pass

            return None

        except Exception as e:
            logger.warning(f"Error creating lattice structure: {str(e)}")
            return None

    def _calculate_weight(self, volume_mm3: float, density: float = 1.2) -> float:
        """
        Calculate weight from volume

        Args:
            volume_mm3: Volume in cubic millimeters
            density: Material density in g/cm³ (default: 1.2 for typical resin)

        Returns:
            Weight in grams
        """
        # Convert mm³ to cm³ (divide by 1000)
        volume_cm3 = volume_mm3 / 1000.0
        weight = volume_cm3 * density
        return weight

    def _calculate_cost_savings(
        self, volume_saved_mm3: float, resin_cost_per_ml: float = 0.05
    ) -> Dict[str, float]:
        """
        Calculate cost savings from material reduction

        Args:
            volume_saved_mm3: Volume saved in mm³
            resin_cost_per_ml: Cost of resin per milliliter (default: $0.05/ml)

        Returns:
            Dictionary with cost savings information
        """
        # Convert mm³ to ml (1 ml = 1000 mm³)
        volume_saved_ml = volume_saved_mm3 / 1000.0

        cost_saved = volume_saved_ml * resin_cost_per_ml

        return {
            "volume_saved_ml": round(volume_saved_ml, 2),
            "cost_saved_usd": round(cost_saved, 2),
            "resin_cost_per_ml": resin_cost_per_ml,
        }

    def get_hollowed_mesh(self) -> Optional[trimesh.Trimesh]:
        """
        Get the hollowed mesh

        Returns:
            Hollowed trimesh object, or None if not yet hollowed
        """
        return self.hollowed_mesh
