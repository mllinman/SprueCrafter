"""
Part Separator Module
Automatically separates 3D models into individual parts
and categorizes them for sprue organization
"""

import trimesh
import numpy as np
from scipy.spatial import ConvexHull
import os
import tempfile


class PartSeparator:
    """Separates and categorizes model parts"""
    
    PART_CATEGORIES = {
        'body': ['hull', 'fuselage', 'body', 'chassis', 'main'],
        'turret': ['turret', 'turr', 'gun_mount'],
        'weapons': ['gun', 'cannon', 'weapon', 'barrel', 'missile'],
        'wheels': ['wheel', 'tire', 'track', 'suspension', 'road_wheel'],
        'details': ['antenna', 'tool', 'hatch', 'vent', 'stowage'],
        'accessories': ['figure', 'crew', 'decal', 'base']
    }
    
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
    
    def separate_and_categorize(self, input_path):
        """
        Separate model into parts and categorize them
        
        Args:
            input_path: Path to input 3D file
        
        Returns:
            Dictionary with part information and file paths
        """
        # Load mesh
        scene = trimesh.load(input_path)
        
        parts = []
        
        if isinstance(scene, trimesh.Scene):
            # Scene with multiple objects
            for name, geom in scene.geometry.items():
                if isinstance(geom, trimesh.Trimesh):
                    part_info = self._process_part(geom, name)
                    parts.append(part_info)
        else:
            # Single mesh - try to split by connectivity
            mesh = scene
            if isinstance(mesh, trimesh.Trimesh):
                # Split into connected components
                components = mesh.split(only_watertight=False)
                
                for i, component in enumerate(components):
                    part_info = self._process_part(component, f"part_{i}")
                    parts.append(part_info)
        
        # Categorize parts
        categorized_parts = self._categorize_parts(parts)
        
        return {
            'total_parts': len(parts),
            'parts': parts,
            'categorized': categorized_parts
        }
    
    def _process_part(self, mesh, name):
        """Process individual part and extract information"""
        # Save part as separate file
        output_path = os.path.join(self.temp_dir, f"{name}.stl")
        mesh.export(output_path)
        
        # Calculate part properties
        bounds = mesh.bounds
        extents = mesh.extents
        
        return {
            'name': name,
            'file': output_path,
            'vertices': len(mesh.vertices),
            'faces': len(mesh.faces),
            'volume': float(mesh.volume) if mesh.is_volume else 0,
            'surface_area': float(mesh.area),
            'bounds': bounds.tolist(),
            'extents': extents.tolist(),
            'center': mesh.centroid.tolist(),
            'category': self._guess_category(name, mesh)
        }
    
    def _guess_category(self, name, mesh):
        """Guess part category based on name and geometry"""
        name_lower = name.lower()
        
        # Check name against category keywords
        for category, keywords in self.PART_CATEGORIES.items():
            for keyword in keywords:
                if keyword in name_lower:
                    return category
        
        # Fallback: categorize by size
        volume = mesh.volume if mesh.is_volume else 0
        extents = mesh.extents
        
        # Largest part is likely the body
        if volume > 10000:  # Large volume threshold
            return 'body'
        
        # Cylindrical parts might be weapons
        if extents[0] > extents[1] * 3 and extents[0] > extents[2] * 3:
            return 'weapons'
        
        # Small parts are details
        if volume < 100:
            return 'details'
        
        return 'accessories'
    
    def _categorize_parts(self, parts):
        """Organize parts by category"""
        categorized = {category: [] for category in self.PART_CATEGORIES.keys()}
        categorized['uncategorized'] = []
        
        for part in parts:
            category = part.get('category', 'uncategorized')
            if category in categorized:
                categorized[category].append(part)
            else:
                categorized['uncategorized'].append(part)
        
        return categorized
    
    def optimize_part_orientation(self, mesh):
        """
        Optimize part orientation for resin printing
        Minimizes supports needed
        """
        # Find the orientation that minimizes the bottom surface area
        # This reduces the need for supports
        
        best_orientation = None
        min_bottom_area = float('inf')
        
        # Try different orientations
        for angle_x in [0, 90, 180, 270]:
            for angle_y in [0, 90, 180, 270]:
                # Rotate mesh
                rotation = trimesh.transformations.euler_matrix(
                    np.radians(angle_x), 
                    np.radians(angle_y), 
                    0
                )
                rotated = mesh.copy()
                rotated.apply_transform(rotation)
                
                # Calculate bottom surface area (z-min)
                z_min = rotated.bounds[0][2]
                bottom_faces = rotated.faces[
                    np.all(rotated.vertices[rotated.faces][:, :, 2] < z_min + 1, axis=1)
                ]
                bottom_area = sum([rotated.area_faces[i] for i in range(len(bottom_faces))])
                
                if bottom_area < min_bottom_area:
                    min_bottom_area = bottom_area
                    best_orientation = rotation
        
        return best_orientation
