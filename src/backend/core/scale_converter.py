"""
Scale Converter Module
Converts 3D models to specific scales (e.g., 1/35th scale for modeling)
"""

import trimesh
import numpy as np
import os
import tempfile


class ScaleConverter:
    """Handles scaling of 3D models"""
    
    # Standard model scales
    STANDARD_SCALES = {
        '1/35': 1/35,
        '1/48': 1/48,
        '1/72': 1/72,
        '1/144': 1/144,
        '1/350': 1/350,
        '1/700': 1/700
    }
    
    # Unit conversions to mm
    UNIT_TO_MM = {
        'mm': 1.0,
        'cm': 10.0,
        'in': 25.4,
        'ft': 304.8,
        'm': 1000.0
    }
    
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
    
    def scale_model(self, input_path, scale=1/35, unit='mm'):
        """
        Scale a 3D model to specified scale
        
        Args:
            input_path: Path to input 3D file
            scale: Scale factor (e.g., 1/35 for 1:35 scale)
            unit: Input unit of measurement
        
        Returns:
            Path to scaled model file
        """
        # Load mesh
        mesh = trimesh.load(input_path, force='mesh')
        
        if isinstance(mesh, trimesh.Scene):
            mesh = trimesh.util.concatenate(
                [geom for geom in mesh.geometry.values() if isinstance(geom, trimesh.Trimesh)]
            )
        
        # Get unit conversion factor
        unit_factor = self.UNIT_TO_MM.get(unit.lower(), 1.0)
        
        # Calculate total scale factor
        total_scale = scale * unit_factor
        
        # Apply scaling
        mesh.apply_scale(total_scale)
        
        # Generate output filename
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        ext = os.path.splitext(input_path)[1]
        output_path = os.path.join(self.temp_dir, f"{base_name}_scaled{ext}")
        
        # Export scaled mesh
        mesh.export(output_path)
        
        return output_path
    
    def get_real_world_dimensions(self, mesh, scale=1/35, unit='mm'):
        """
        Calculate real-world dimensions from scaled model
        
        Args:
            mesh: Trimesh object
            scale: Scale factor used
            unit: Target unit
        
        Returns:
            Dictionary with real-world dimensions
        """
        extents = mesh.extents
        unit_factor = self.UNIT_TO_MM.get(unit.lower(), 1.0)
        
        # Calculate real-world size
        real_extents = extents / (scale * unit_factor)
        
        return {
            'length': float(real_extents[0]),
            'width': float(real_extents[1]),
            'height': float(real_extents[2]),
            'unit': unit
        }
    
    def auto_scale_to_target_size(self, input_path, target_size_mm, dimension='length'):
        """
        Automatically scale model to fit a target size
        
        Args:
            input_path: Path to input 3D file
            target_size_mm: Target size in millimeters
            dimension: Which dimension to match ('length', 'width', or 'height')
        
        Returns:
            Path to scaled model file
        """
        # Load mesh
        mesh = trimesh.load(input_path, force='mesh')
        
        if isinstance(mesh, trimesh.Scene):
            mesh = trimesh.util.concatenate(
                [geom for geom in mesh.geometry.values() if isinstance(geom, trimesh.Trimesh)]
            )
        
        # Get current dimensions
        extents = mesh.extents
        dim_map = {'length': 0, 'width': 1, 'height': 2}
        current_size = extents[dim_map.get(dimension, 0)]
        
        # Calculate required scale
        scale_factor = target_size_mm / current_size
        
        # Apply scaling
        mesh.apply_scale(scale_factor)
        
        # Generate output filename
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        ext = os.path.splitext(input_path)[1]
        output_path = os.path.join(self.temp_dir, f"{base_name}_scaled{ext}")
        
        # Export scaled mesh
        mesh.export(output_path)
        
        return output_path
