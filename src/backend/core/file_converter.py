"""
File Converter Module
Converts between various 3D file formats
Supports: STL, OBJ, FBX, 3DS, PLY, GLTF, DAE, and more
"""

import trimesh
import os
import tempfile


class FileConverter:
    """Handles conversion between different 3D file formats"""
    
    SUPPORTED_FORMATS = [
        'stl', 'obj', 'ply', 'off', 'gltf', 'glb', 
        'dae', '3ds', 'fbx', 'step', 'iges'
    ]
    
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
    
    def convert(self, input_path, target_format):
        """
        Convert 3D file to target format
        
        Args:
            input_path: Path to input 3D file
            target_format: Target format (e.g., 'stl', 'obj')
        
        Returns:
            Path to converted file
        """
        if target_format.lower() not in self.SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported format: {target_format}")
        
        # Load mesh using trimesh
        try:
            mesh = trimesh.load(input_path, force='mesh')
            
            # Handle scene vs single mesh
            if isinstance(mesh, trimesh.Scene):
                # Combine all geometries in scene
                mesh = trimesh.util.concatenate(
                    [geom for geom in mesh.geometry.values() if isinstance(geom, trimesh.Trimesh)]
                )
        except Exception as e:
            raise Exception(f"Failed to load 3D file: {str(e)}")
        
        # Generate output filename
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        output_path = os.path.join(self.temp_dir, f"{base_name}_converted.{target_format}")
        
        # Export to target format
        try:
            mesh.export(output_path)
        except Exception as e:
            raise Exception(f"Failed to export to {target_format}: {str(e)}")
        
        return output_path
    
    def get_mesh_info(self, file_path):
        """
        Get information about a 3D mesh
        
        Returns:
            Dictionary with mesh statistics
        """
        mesh = trimesh.load(file_path, force='mesh')
        
        if isinstance(mesh, trimesh.Scene):
            mesh = trimesh.util.concatenate(
                [geom for geom in mesh.geometry.values() if isinstance(geom, trimesh.Trimesh)]
            )
        
        return {
            'vertices': len(mesh.vertices),
            'faces': len(mesh.faces),
            'bounds': mesh.bounds.tolist(),
            'extents': mesh.extents.tolist(),
            'volume': float(mesh.volume),
            'surface_area': float(mesh.area),
            'is_watertight': bool(mesh.is_watertight),
            'is_convex': bool(mesh.is_convex)
        }
