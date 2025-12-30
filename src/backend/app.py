"""
SprueCrafter Backend API
Main Flask application for 3D model processing and sprue generation
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import tempfile
import traceback

# Add src to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.file_converter import FileConverter
from core.scale_converter import ScaleConverter
from core.part_separator import PartSeparator
from core.sprue_generator import SprueGenerator
from core.photo_to_model import PhotoToModel
from core.transformer import Transformer
from core.support_generator import SupportGenerator

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = tempfile.mkdtemp()
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'SprueCrafter API is running'})


@app.route('/api/convert', methods=['POST'])
def convert_file():
    """
    Convert 3D file to another format
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        target_format = request.form.get('format', 'stl')
        
        # Save uploaded file
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(input_path)
        
        # Convert file
        converter = FileConverter()
        output_path = converter.convert(input_path, target_format)
        
        return send_file(output_path, as_attachment=True)
    
    except Exception as e:
        print(f"Error in convert_file: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/scale', methods=['POST'])
def scale_model():
    """
    Scale 3D model to 1/35th or custom scale
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        scale = float(request.form.get('scale', 1/35))
        unit = request.form.get('unit', 'mm')
        
        # Save uploaded file
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(input_path)
        
        # Scale model
        converter = ScaleConverter()
        output_path = converter.scale_model(input_path, scale, unit)
        
        return send_file(output_path, as_attachment=True)
    
    except Exception as e:
        print(f"Error in scale_model: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/separate', methods=['POST'])
def separate_parts():
    """
    Automatically separate model into parts
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Save uploaded file
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(input_path)
        
        # Separate parts
        separator = PartSeparator()
        parts_info = separator.separate_and_categorize(input_path)
        
        return jsonify(parts_info)
    
    except Exception as e:
        print(f"Error in separate_parts: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate-sprue', methods=['POST'])
def generate_sprue():
    """
    Generate sprue layout for resin printing
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        build_plate_x = float(request.form.get('build_plate_x', 192))
        build_plate_y = float(request.form.get('build_plate_y', 120))
        build_plate_z = float(request.form.get('build_plate_z', 245))
        connector_type = request.form.get('connector_type', 'cylindrical')
        
        # Save uploaded file
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(input_path)
        
        # Generate sprue
        generator = SprueGenerator()
        sprue_file = generator.generate(
            input_path, 
            (build_plate_x, build_plate_y, build_plate_z),
            connector_type=connector_type
        )
        
        return send_file(sprue_file, as_attachment=True)
    
    except Exception as e:
        print(f"Error in generate_sprue: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/photo-to-model', methods=['POST'])
def photo_to_model():
    """
    Convert photographs to 3D model
    """
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        photo_paths = []
        
        for file in files:
            photo_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(photo_path)
            photo_paths.append(photo_path)
        
        # Convert photos to model
        converter = PhotoToModel()
        model_path = converter.convert(photo_paths)
        
        return send_file(model_path, as_attachment=True)
    
    except Exception as e:
        print(f"Error in photo_to_model: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/transform', methods=['POST'])
def transform_model():
    """
    Transform 3D model (rotate, translate, scale)
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        operation = request.form.get('operation', 'rotate')
        
        # Save uploaded file
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(input_path)
        
        # Get operation-specific parameters
        transformer = Transformer()
        
        if operation == 'rotate':
            axis = request.form.get('axis', 'z')
            angle = float(request.form.get('angle', 0))
            output_path = transformer.transform(
                input_path, 'rotate', axis=axis, angle=angle
            )
        elif operation == 'translate':
            x = float(request.form.get('x', 0))
            y = float(request.form.get('y', 0))
            z = float(request.form.get('z', 0))
            output_path = transformer.transform(
                input_path, 'translate', x=x, y=y, z=z
            )
        elif operation == 'scale':
            factor = float(request.form.get('factor', 1.0))
            output_path = transformer.transform(
                input_path, 'scale', factor=factor
            )
        else:
            return jsonify({'error': f'Unknown operation: {operation}'}), 400
        
        return send_file(output_path, as_attachment=True)
    
    except Exception as e:
        print(f"Error in transform_model: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate-supports', methods=['POST'])
def generate_supports():
    """
    Generate support structures for 3D printing
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        mode = request.form.get('mode', 'automatic')
        
        # Save uploaded file
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(input_path)
        
        generator = SupportGenerator()
        
        if mode == 'automatic':
            overhang_angle = request.form.get('overhang_angle')
            density = request.form.get('density')
            
            if overhang_angle:
                overhang_angle = float(overhang_angle)
            if density:
                density = float(density)
            
            output_path = generator.generate_automatic_supports(
                input_path,
                overhang_angle=overhang_angle,
                density=density
            )
        elif mode == 'manual':
            # Get support points from request
            import json
            support_points_json = request.form.get('support_points', '[]')
            support_points = json.loads(support_points_json)
            
            output_path = generator.generate_manual_supports(
                input_path,
                support_points
            )
        elif mode == 'estimate':
            # Return estimation without generating supports
            analysis = generator.estimate_support_requirements(input_path)
            return jsonify(analysis)
        else:
            return jsonify({'error': f'Unknown mode: {mode}'}), 400
        
        return send_file(output_path, as_attachment=True)
    
    except Exception as e:
        print(f"Error in generate_supports: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/connector-types', methods=['GET'])
def get_connector_types():
    """
    Get available sprue connector types
    """
    connector_types = {
        'cylindrical': {
            'name': 'Cylindrical',
            'description': 'Traditional cylindrical connectors (standard)'
        },
        'pyramid': {
            'name': 'Pyramid',
            'description': 'Pyramid-shaped connectors'
        },
        'triangular': {
            'name': 'Triangular',
            'description': 'Triangular prism connectors'
        },
        'square': {
            'name': 'Square',
            'description': 'Square prism connectors'
        },
        'spherical': {
            'name': 'Spherical',
            'description': 'Spherical/beaded connectors'
        }
    }
    return jsonify(connector_types)


@app.route('/api/printer-profiles', methods=['GET'])
def get_printer_profiles():
    """
    Get available resin printer profiles
    """
    profiles = {
        'elegoo_mars_3': {
            'name': 'Elegoo Mars 3',
            'build_volume': {'x': 143.43, 'y': 89.6, 'z': 175}
        },
        'elegoo_saturn': {
            'name': 'Elegoo Saturn',
            'build_volume': {'x': 192, 'y': 120, 'z': 200}
        },
        'elegoo_saturn_2': {
            'name': 'Elegoo Saturn 2',
            'build_volume': {'x': 218.88, 'y': 122.88, 'z': 250}
        },
        'elegoo_jupiter': {
            'name': 'Elegoo Jupiter',
            'build_volume': {'x': 277.848, 'y': 156.096, 'z': 300}
        },
        'anycubic_photon_mono_4k': {
            'name': 'Anycubic Photon Mono 4K',
            'build_volume': {'x': 132, 'y': 80, 'z': 165}
        },
        'phrozen_sonic_mighty_4k': {
            'name': 'Phrozen Sonic Mighty 4K',
            'build_volume': {'x': 200, 'y': 125, 'z': 220}
        },
        'creality_halot_one': {
            'name': 'Creality Halot One',
            'build_volume': {'x': 127, 'y': 80, 'z': 160}
        },
        'custom': {
            'name': 'Custom Printer',
            'build_volume': {'x': 192, 'y': 120, 'z': 245}
        }
    }
    return jsonify(profiles)


if __name__ == '__main__':
    print("Starting SprueCrafter Backend API...")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    app.run(host='127.0.0.1', port=5000, debug=True)
