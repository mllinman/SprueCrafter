"""
Transformer Module
Provides transformation operations for 3D models (rotate, translate, scale)
"""

import trimesh
import numpy as np
import os
import tempfile
import shutil


class Transformer:
    """Handles 3D model transformations"""
    
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
    
    def __del__(self):
        """Cleanup temporary directory on object destruction"""
        self.cleanup()
    
    def cleanup(self):
        """Remove temporary directory and all its contents"""
        if hasattr(self, 'temp_dir') and os.path.exists(self.temp_dir):
            try:
                shutil.rmtree(self.temp_dir)
            except Exception:
                pass  # Ignore cleanup errors
    
    def transform(self, input_path, operation, **params):
        """
        Apply transformation to 3D model
        
        Args:
            input_path: Path to input 3D model
            operation: Type of operation ('rotate', 'translate', 'scale')
            **params: Operation-specific parameters
        
        Returns:
            Path to transformed model file
        """
        # Load model
        mesh = trimesh.load(input_path)
        
        # Apply transformation based on operation
        if operation == 'rotate':
            transformed_mesh = self.rotate(mesh, **params)
        elif operation == 'translate':
            transformed_mesh = self.translate(mesh, **params)
        elif operation == 'scale':
            transformed_mesh = self.scale(mesh, **params)
        else:
            raise ValueError(f"Unknown operation: {operation}")
        
        # Export transformed model
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        output_path = os.path.join(self.temp_dir, f"{base_name}_transformed.stl")
        transformed_mesh.export(output_path)
        
        return output_path
    
    def rotate(self, mesh, axis='z', angle=0, center=None):
        """
        Rotate model around specified axis
        
        Args:
            mesh: Trimesh object
            axis: Rotation axis ('x', 'y', 'z') or custom axis vector [x, y, z]
            angle: Rotation angle in degrees
            center: Center of rotation (default: mesh centroid)
        
        Returns:
            Rotated Trimesh object
        """
        # Copy mesh to avoid modifying original
        rotated_mesh = mesh.copy()
        
        # Determine rotation axis
        if isinstance(axis, str):
            axis_vectors = {
                'x': [1, 0, 0],
                'y': [0, 1, 0],
                'z': [0, 0, 1]
            }
            axis_vector = axis_vectors.get(axis.lower(), [0, 0, 1])
        else:
            axis_vector = np.array(axis)
        
        # Determine center of rotation
        if center is None:
            center = rotated_mesh.centroid
        else:
            center = np.array(center)
        
        # Convert angle to radians
        angle_rad = np.radians(angle)
        
        # Create rotation matrix
        rotation_matrix = trimesh.transformations.rotation_matrix(
            angle_rad, axis_vector, center
        )
        
        # Apply rotation
        rotated_mesh.apply_transform(rotation_matrix)
        
        return rotated_mesh
    
    def translate(self, mesh, x=0, y=0, z=0):
        """
        Translate model by specified amounts
        
        Args:
            mesh: Trimesh object
            x: Translation along X axis (mm)
            y: Translation along Y axis (mm)
            z: Translation along Z axis (mm)
        
        Returns:
            Translated Trimesh object
        """
        # Copy mesh to avoid modifying original
        translated_mesh = mesh.copy()
        
        # Create translation vector
        translation = np.array([x, y, z])
        
        # Apply translation
        translated_mesh.apply_translation(translation)
        
        return translated_mesh
    
    def scale(self, mesh, factor=1.0, uniform=True, scale_x=1.0, scale_y=1.0, scale_z=1.0):
        """
        Scale model
        
        Args:
            mesh: Trimesh object
            factor: Uniform scale factor (if uniform=True)
            uniform: Whether to scale uniformly
            scale_x: Scale factor for X axis (if uniform=False)
            scale_y: Scale factor for Y axis (if uniform=False)
            scale_z: Scale factor for Z axis (if uniform=False)
        
        Returns:
            Scaled Trimesh object
        """
        # Copy mesh to avoid modifying original
        scaled_mesh = mesh.copy()
        
        if uniform:
            # Uniform scaling
            scaled_mesh.apply_scale(factor)
        else:
            # Non-uniform scaling
            scale_matrix = np.diag([scale_x, scale_y, scale_z, 1.0])
            scaled_mesh.apply_transform(scale_matrix)
        
        return scaled_mesh
    
    def batch_transform(self, input_path, transformations):
        """
        Apply multiple transformations in sequence
        
        Args:
            input_path: Path to input 3D model
            transformations: List of transformation dictionaries
                Each dict should have 'operation' and relevant parameters
        
        Returns:
            Path to transformed model file
        """
        # Load model
        mesh = trimesh.load(input_path)
        
        # Apply each transformation in sequence
        for transform in transformations:
            operation = transform.get('operation')
            params = {k: v for k, v in transform.items() if k != 'operation'}
            
            if operation == 'rotate':
                mesh = self.rotate(mesh, **params)
            elif operation == 'translate':
                mesh = self.translate(mesh, **params)
            elif operation == 'scale':
                mesh = self.scale(mesh, **params)
        
        # Export transformed model
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        output_path = os.path.join(self.temp_dir, f"{base_name}_transformed.stl")
        mesh.export(output_path)
        
        return output_path
