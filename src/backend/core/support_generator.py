"""
Support Generator Module
Generates automatic and manual supports for 3D printing
"""

import trimesh
import numpy as np
import os
import tempfile
from scipy.spatial import KDTree


class SupportGenerator:
    """Generates support structures for 3D models"""
    
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        
        # Support parameters (in mm)
        self.support_diameter = 0.4      # Diameter of support pillars
        self.support_tip_diameter = 0.2  # Diameter at contact point
        self.support_base_diameter = 1.0 # Diameter at base
        self.min_overhang_angle = 45     # Minimum angle for support (degrees)
        self.support_density = 5.0       # Spacing between supports (mm)
        self.platform_height = 0.0       # Z height of build platform
    
    def generate_automatic_supports(self, input_path, overhang_angle=None, density=None):
        """
        Generate automatic supports based on overhang analysis
        
        Args:
            input_path: Path to 3D model
            overhang_angle: Minimum overhang angle requiring support (degrees)
            density: Spacing between support points (mm)
        
        Returns:
            Path to model with supports
        """
        if overhang_angle is not None:
            self.min_overhang_angle = overhang_angle
        if density is not None:
            self.support_density = density
        
        # Load model
        mesh = trimesh.load(input_path)
        
        # Ensure mesh is a single Trimesh object
        if isinstance(mesh, trimesh.Scene):
            mesh = trimesh.util.concatenate([
                geom for geom in mesh.geometry.values()
                if isinstance(geom, trimesh.Trimesh)
            ])
        
        # Find areas needing support
        support_points = self._find_overhang_areas(mesh)
        
        # Generate support structures
        support_meshes = self._create_support_pillars(support_points, mesh.bounds[0][2])
        
        # Combine model and supports
        if support_meshes:
            all_meshes = [mesh] + support_meshes
            final_mesh = trimesh.util.concatenate(all_meshes)
        else:
            final_mesh = mesh
        
        # Export
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        output_path = os.path.join(self.temp_dir, f"{base_name}_with_supports.stl")
        final_mesh.export(output_path)
        
        return output_path
    
    def generate_manual_supports(self, input_path, support_points):
        """
        Generate supports at manually specified points
        
        Args:
            input_path: Path to 3D model
            support_points: List of (x, y, z) coordinates for support placement
        
        Returns:
            Path to model with supports
        """
        # Load model
        mesh = trimesh.load(input_path)
        
        # Ensure mesh is a single Trimesh object
        if isinstance(mesh, trimesh.Scene):
            mesh = trimesh.util.concatenate([
                geom for geom in mesh.geometry.values()
                if isinstance(geom, trimesh.Trimesh)
            ])
        
        # Convert support points to numpy array
        points = np.array(support_points)
        
        # Generate support structures at specified points
        support_meshes = self._create_support_pillars(points, mesh.bounds[0][2])
        
        # Combine model and supports
        if support_meshes:
            all_meshes = [mesh] + support_meshes
            final_mesh = trimesh.util.concatenate(all_meshes)
        else:
            final_mesh = mesh
        
        # Export
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        output_path = os.path.join(self.temp_dir, f"{base_name}_with_supports.stl")
        final_mesh.export(output_path)
        
        return output_path
    
    def _find_overhang_areas(self, mesh):
        """
        Analyze mesh to find areas requiring support
        
        Args:
            mesh: Trimesh object
        
        Returns:
            Numpy array of (x, y, z) coordinates needing support
        """
        support_points = []
        
        # Get face normals and centroids
        face_normals = mesh.face_normals
        face_centroids = mesh.triangles.mean(axis=1)
        
        # Check each face for overhang
        for i, normal in enumerate(face_normals):
            # Calculate angle with vertical (Z-axis)
            z_component = normal[2]
            angle = np.degrees(np.arccos(np.clip(abs(z_component), 0, 1)))
            
            # If face is pointing downward and exceeds angle threshold
            if z_component < 0 and angle > self.min_overhang_angle:
                centroid = face_centroids[i]
                support_points.append(centroid)
        
        if not support_points:
            return np.array([])
        
        support_points = np.array(support_points)
        
        # Filter points by density (remove points too close together)
        if len(support_points) > 1:
            support_points = self._filter_by_density(support_points)
        
        return support_points
    
    def _filter_by_density(self, points):
        """
        Filter points to maintain minimum spacing
        
        Args:
            points: Numpy array of points
        
        Returns:
            Filtered numpy array of points
        """
        if len(points) == 0:
            return points
        
        filtered = [points[0]]
        tree = KDTree([points[0]])
        
        for point in points[1:]:
            # Check distance to nearest existing support
            distance, _ = tree.query(point)
            
            if distance >= self.support_density:
                filtered.append(point)
                # Rebuild tree with new point
                tree = KDTree(filtered)
        
        return np.array(filtered)
    
    def _create_support_pillars(self, support_points, base_z):
        """
        Create support pillar meshes
        
        Args:
            support_points: Numpy array of (x, y, z) coordinates
            base_z: Z coordinate of build platform
        
        Returns:
            List of support Trimesh objects
        """
        if len(support_points) == 0:
            return []
        
        support_meshes = []
        
        for point in support_points:
            x, y, z = point
            
            # Calculate support height
            height = z - base_z
            
            if height <= 0:
                continue
            
            # Create tapered support pillar (cone shape)
            support = trimesh.creation.cone(
                radius=self.support_base_diameter / 2,
                height=height,
                sections=8
            )
            
            # Position support
            support.apply_translation([x, y, base_z + height / 2])
            
            support_meshes.append(support)
        
        return support_meshes
    
    def estimate_support_requirements(self, input_path):
        """
        Analyze model and estimate support requirements
        
        Args:
            input_path: Path to 3D model
        
        Returns:
            Dictionary with support analysis
        """
        # Load model
        mesh = trimesh.load(input_path)
        
        # Ensure mesh is a single Trimesh object
        if isinstance(mesh, trimesh.Scene):
            mesh = trimesh.util.concatenate([
                geom for geom in mesh.geometry.values()
                if isinstance(geom, trimesh.Trimesh)
            ])
        
        # Find overhang areas
        support_points = self._find_overhang_areas(mesh)
        
        # Calculate statistics
        num_supports = len(support_points)
        
        if num_supports > 0:
            avg_height = np.mean(support_points[:, 2]) - mesh.bounds[0][2]
            # Support volume calculation for cone: V = (1/3) * π * r² * h
            total_material = num_supports * avg_height * np.pi * (self.support_base_diameter / 2) ** 2 / 3
        else:
            avg_height = 0
            total_material = 0
        
        return {
            'num_supports': int(num_supports),
            'avg_height': float(avg_height),
            'estimated_material': float(total_material),
            'support_points': support_points.tolist() if num_supports > 0 else []
        }
