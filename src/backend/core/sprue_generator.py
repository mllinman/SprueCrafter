"""
Sprue Generator Module
Generates optimized sprue layouts for resin printing
Rivals industry-standard quality (Meng, Takom)
"""

import trimesh
import numpy as np
import os
import tempfile
from scipy.spatial import distance


class SprueGenerator:
    """Generates professional-quality sprues for resin printing"""
    
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        
        # Sprue parameters (in mm)
        self.runner_diameter = 2.0  # Main sprue runner thickness
        self.gate_diameter = 1.0    # Connection point to parts
        self.gate_height = 2.0      # Height of gate connection
        self.part_spacing = 5.0     # Minimum spacing between parts
        self.border_margin = 5.0    # Margin from build plate edge
    
    def generate(self, input_path, build_plate_size=(192, 120, 245)):
        """
        Generate optimized sprue layout
        
        Args:
            input_path: Path to 3D model or parts
            build_plate_size: (x, y, z) dimensions in mm
        
        Returns:
            Path to generated sprue file
        """
        # Load model/parts
        scene = trimesh.load(input_path)
        
        parts = []
        if isinstance(scene, trimesh.Scene):
            parts = [geom for geom in scene.geometry.values() 
                    if isinstance(geom, trimesh.Trimesh)]
        else:
            # Split single mesh into components
            if isinstance(scene, trimesh.Trimesh):
                parts = scene.split(only_watertight=False)
        
        if not parts:
            parts = [scene]
        
        # Arrange parts on build plate
        arranged_parts = self._arrange_parts(parts, build_plate_size)
        
        # Generate runners and gates
        sprue_mesh = self._create_sprue_structure(arranged_parts, build_plate_size)
        
        # Combine everything
        final_mesh = self._combine_parts_and_sprue(arranged_parts, sprue_mesh)
        
        # Export
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        output_path = os.path.join(self.temp_dir, f"{base_name}_sprue.stl")
        final_mesh.export(output_path)
        
        return output_path
    
    def _arrange_parts(self, parts, build_plate_size):
        """
        Arrange parts optimally on build plate
        Uses bin packing algorithm for efficient space usage
        """
        plate_x, plate_y, plate_z = build_plate_size
        
        # Sort parts by volume (largest first)
        parts_with_info = []
        for part in parts:
            bounds = part.bounds
            extents = part.extents
            parts_with_info.append({
                'mesh': part,
                'extents': extents,
                'volume': part.volume if part.is_volume else 0
            })
        
        parts_with_info.sort(key=lambda x: x['volume'], reverse=True)
        
        # Arrange using 2D bin packing
        arranged = []
        current_x = self.border_margin
        current_y = self.border_margin
        row_height = 0
        
        for part_info in parts_with_info:
            mesh = part_info['mesh']
            extents = part_info['extents']
            
            # Check if part fits in current position
            if current_x + extents[0] + self.border_margin > plate_x:
                # Move to next row
                current_x = self.border_margin
                current_y += row_height + self.part_spacing
                row_height = 0
            
            # Check if part fits on plate at all
            if (current_y + extents[1] + self.border_margin > plate_y or
                extents[2] > plate_z):
                print(f"Warning: Part too large for build plate, skipping")
                continue
            
            # Position part
            offset = np.array([
                current_x - mesh.bounds[0][0],
                current_y - mesh.bounds[0][1],
                self.gate_height - mesh.bounds[0][2]  # Elevate above build plate
            ])
            
            positioned_mesh = mesh.copy()
            positioned_mesh.apply_translation(offset)
            
            arranged.append({
                'mesh': positioned_mesh,
                'position': np.array([current_x, current_y, self.gate_height]),
                'extents': extents
            })
            
            # Update position for next part
            current_x += extents[0] + self.part_spacing
            row_height = max(row_height, extents[1])
        
        return arranged
    
    def _create_sprue_structure(self, arranged_parts, build_plate_size):
        """
        Create runner and gate system
        Professional-quality sprue structure
        """
        plate_x, plate_y, _ = build_plate_size
        
        # Create main runner (horizontal bar across build plate)
        runner_center_y = plate_y / 2
        runner_length = plate_x - 2 * self.border_margin
        
        # Main runner cylinder
        main_runner = trimesh.creation.cylinder(
            radius=self.runner_diameter / 2,
            height=runner_length,
            sections=16
        )
        
        # Rotate to horizontal
        rotation = trimesh.transformations.rotation_matrix(
            np.radians(90), [0, 1, 0]
        )
        main_runner.apply_transform(rotation)
        
        # Position runner
        main_runner.apply_translation([
            plate_x / 2,
            runner_center_y,
            self.gate_height / 2
        ])
        
        # Create gates connecting parts to main runner
        gate_meshes = [main_runner]
        
        for part_info in arranged_parts:
            position = part_info['position']
            extents = part_info['extents']
            
            # Gate position (from runner to part)
            gate_start = np.array([
                position[0] + extents[0] / 2,
                runner_center_y,
                self.gate_height / 2
            ])
            gate_end = np.array([
                position[0] + extents[0] / 2,
                position[1],
                self.gate_height
            ])
            
            # Create gate cylinder
            gate_length = np.linalg.norm(gate_end - gate_start)
            if gate_length > 0:
                gate = trimesh.creation.cylinder(
                    radius=self.gate_diameter / 2,
                    height=gate_length,
                    sections=12
                )
                
                # Orient gate
                direction = gate_end - gate_start
                direction = direction / np.linalg.norm(direction)
                
                # Rotation to align with direction
                default_dir = np.array([0, 0, 1])
                rotation_axis = np.cross(default_dir, direction)
                
                if np.linalg.norm(rotation_axis) > 0.001:
                    rotation_axis = rotation_axis / np.linalg.norm(rotation_axis)
                    angle = np.arccos(np.dot(default_dir, direction))
                    rotation = trimesh.transformations.rotation_matrix(
                        angle, rotation_axis
                    )
                    gate.apply_transform(rotation)
                
                # Position gate
                gate.apply_translation((gate_start + gate_end) / 2)
                gate_meshes.append(gate)
        
        # Combine all sprue elements
        if len(gate_meshes) > 1:
            sprue_mesh = trimesh.util.concatenate(gate_meshes)
        else:
            sprue_mesh = gate_meshes[0]
        
        return sprue_mesh
    
    def _combine_parts_and_sprue(self, arranged_parts, sprue_mesh):
        """Combine all parts with sprue structure"""
        all_meshes = [sprue_mesh]
        
        for part_info in arranged_parts:
            all_meshes.append(part_info['mesh'])
        
        return trimesh.util.concatenate(all_meshes)
    
    def generate_multi_sprue_set(self, parts_by_category, build_plate_size):
        """
        Generate multiple sprues organized by part category
        Similar to professional model kits
        
        Args:
            parts_by_category: Dictionary of categorized parts
            build_plate_size: Build plate dimensions
        
        Returns:
            List of sprue file paths
        """
        sprue_files = []
        
        for category, parts in parts_by_category.items():
            if not parts:
                continue
            
            # Create sprue for this category
            sprue_path = self._generate_category_sprue(
                category, parts, build_plate_size
            )
            sprue_files.append({
                'category': category,
                'file': sprue_path,
                'part_count': len(parts)
            })
        
        return sprue_files
    
    def _generate_category_sprue(self, category, parts, build_plate_size):
        """Generate sprue for specific part category"""
        # Load part meshes
        meshes = []
        for part in parts:
            if 'file' in part:
                mesh = trimesh.load(part['file'])
                meshes.append(mesh)
        
        # Arrange and create sprue
        arranged_parts = self._arrange_parts(meshes, build_plate_size)
        sprue_mesh = self._create_sprue_structure(arranged_parts, build_plate_size)
        final_mesh = self._combine_parts_and_sprue(arranged_parts, sprue_mesh)
        
        # Export
        output_path = os.path.join(self.temp_dir, f"sprue_{category}.stl")
        final_mesh.export(output_path)
        
        return output_path
