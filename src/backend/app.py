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
import logging
from functools import wraps

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    'stl', 'obj', 'fbx', '3ds', 'ply', 'gltf', 'glb', 'dae',
    'jpg', 'jpeg', 'png', 'bmp', 'tiff'
}


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def handle_errors(f):
    """Decorator for consistent error handling"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            logger.error(f"Validation error in {f.__name__}: {str(e)}")
            return jsonify({'error': f'Invalid input: {str(e)}'}), 400
        except FileNotFoundError as e:
            logger.error(f"File not found in {f.__name__}: {str(e)}")
            return jsonify({'error': 'File not found'}), 404
        except MemoryError as e:
            logger.error(f"Memory error in {f.__name__}: {str(e)}")
            return jsonify({'error': 'File too large or system out of memory'}), 413
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({'error': 'Internal server error'}), 500
    return decorated_function


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'SprueCrafter API is running',
        'version': '1.0.0'
    })


@app.route('/api/convert', methods=['POST'])
@handle_errors
def convert_file():
    """
    Convert 3D file to another format
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    target_format = request.form.get('format', 'stl').lower()
    
    if target_format not in ['stl', 'obj', 'ply', 'off', 'dae']:
        return jsonify({'error': f'Invalid target format: {target_format}'}), 400
    
    logger.info(f"Converting {file.filename} to {target_format}")
    
    # Save uploaded file
    input_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(input_path)
    
    # Convert file
    converter = FileConverter()
    output_path = converter.convert(input_path, target_format)
    
    return send_file(output_path, as_attachment=True)


@app.route('/api/scale', methods=['POST'])
@handle_errors
def scale_model():
    """
    Scale 3D model to 1/35th or custom scale
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        scale = float(request.form.get('scale', 1/35))
        if scale <= 0 or scale > 1000:
            return jsonify({'error': 'Scale must be between 0 and 1000'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid scale value'}), 400
    
    unit = request.form.get('unit', 'mm').lower()
    if unit not in ['mm', 'cm', 'in', 'm']:
        return jsonify({'error': 'Invalid unit. Must be mm, cm, in, or m'}), 400
    
    logger.info(f"Scaling {file.filename} by {scale} ({unit})")
    
    # Save uploaded file
    input_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(input_path)
    
    # Scale model
    converter = ScaleConverter()
    output_path = converter.scale_model(input_path, scale, unit)
    
    return send_file(output_path, as_attachment=True)


@app.route('/api/separate', methods=['POST'])
@handle_errors
def separate_parts():
    """
    Automatically separate model into parts
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    logger.info(f"Separating parts in {file.filename}")
    
    # Save uploaded file
    input_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(input_path)
    
    # Separate parts
    separator = PartSeparator()
    parts_info = separator.separate_and_categorize(input_path)
    
    return jsonify(parts_info)


@app.route('/api/generate-sprue', methods=['POST'])
@handle_errors
def generate_sprue():
    """
    Generate sprue layout for resin printing
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        build_plate_x = float(request.form.get('build_plate_x', 192))
        build_plate_y = float(request.form.get('build_plate_y', 120))
        build_plate_z = float(request.form.get('build_plate_z', 245))
        
        # Validate build plate dimensions
        if not (0 < build_plate_x <= 500 and 0 < build_plate_y <= 500 and 0 < build_plate_z <= 500):
            return jsonify({'error': 'Build plate dimensions must be between 0 and 500mm'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid build plate dimensions'}), 400
    
    connector_type = request.form.get('connector_type', 'cylindrical').lower()
    valid_connectors = ['cylindrical', 'pyramid', 'triangular', 'square', 'spherical']
    
    if connector_type not in valid_connectors:
        return jsonify({'error': f'Invalid connector type. Must be one of: {", ".join(valid_connectors)}'}), 400
    
    logger.info(f"Generating sprue for {file.filename} with {connector_type} connectors")
    
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


@app.route('/api/photo-to-model', methods=['POST'])
@handle_errors
def photo_to_model():
    """
    Convert photographs to 3D model
    """
    if 'files' not in request.files:
        return jsonify({'error': 'No files provided'}), 400
    
    files = request.files.getlist('files')
    
    if len(files) < 2:
        return jsonify({'error': 'At least 2 photos required for reconstruction'}), 400
    
    if len(files) > 100:
        return jsonify({'error': 'Maximum 100 photos allowed'}), 400
    
    photo_paths = []
    
    for file in files:
        if not allowed_file(file.filename):
            return jsonify({'error': f'File type not allowed: {file.filename}'}), 400
        
        photo_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(photo_path)
        photo_paths.append(photo_path)
    
    logger.info(f"Converting {len(photo_paths)} photos to 3D model")
    
    # Convert photos to model
    converter = PhotoToModel()
    model_path = converter.convert(photo_paths)
    
    return send_file(model_path, as_attachment=True)


@app.route('/api/transform', methods=['POST'])
@handle_errors
def transform_model():
    """
    Transform 3D model (rotate, translate, scale)
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    operation = request.form.get('operation', 'rotate').lower()
    
    if operation not in ['rotate', 'translate', 'scale']:
        return jsonify({'error': f'Invalid operation: {operation}'}), 400
    
    logger.info(f"Transforming {file.filename} with operation: {operation}")
    
    # Save uploaded file
    input_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(input_path)
    
    # Get operation-specific parameters
    transformer = Transformer()
    
    if operation == 'rotate':
        axis = request.form.get('axis', 'z').lower()
        if axis not in ['x', 'y', 'z']:
            return jsonify({'error': 'Invalid axis. Must be x, y, or z'}), 400
        
        try:
            angle = float(request.form.get('angle', 0))
            if not -360 <= angle <= 360:
                return jsonify({'error': 'Angle must be between -360 and 360 degrees'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid angle value'}), 400
        
        output_path = transformer.transform(
            input_path, 'rotate', axis=axis, angle=angle
        )
    elif operation == 'translate':
        try:
            x = float(request.form.get('x', 0))
            y = float(request.form.get('y', 0))
            z = float(request.form.get('z', 0))
            
            if any(abs(val) > 1000 for val in [x, y, z]):
                return jsonify({'error': 'Translation values must be between -1000 and 1000mm'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid translation values'}), 400
        
        output_path = transformer.transform(
            input_path, 'translate', x=x, y=y, z=z
        )
    elif operation == 'scale':
        try:
            factor = float(request.form.get('factor', 1.0))
            if not 0.001 <= factor <= 1000:
                return jsonify({'error': 'Scale factor must be between 0.001 and 1000'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid scale factor'}), 400
        
        output_path = transformer.transform(
            input_path, 'scale', factor=factor
        )
    
    return send_file(output_path, as_attachment=True)


@app.route('/api/generate-supports', methods=['POST'])
@handle_errors
def generate_supports():
    """
    Generate support structures for 3D printing
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    mode = request.form.get('mode', 'automatic').lower()
    
    if mode not in ['automatic', 'manual', 'estimate']:
        return jsonify({'error': f'Invalid mode: {mode}'}), 400
    
    logger.info(f"Generating supports for {file.filename} in {mode} mode")
    
    # Save uploaded file
    input_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(input_path)
    
    generator = SupportGenerator()
    
    if mode == 'automatic':
        overhang_angle = request.form.get('overhang_angle')
        density = request.form.get('density')
        
        if overhang_angle:
            try:
                overhang_angle = float(overhang_angle)
                if not 0 <= overhang_angle <= 90:
                    return jsonify({'error': 'Overhang angle must be between 0 and 90 degrees'}), 400
            except ValueError:
                return jsonify({'error': 'Invalid overhang angle value'}), 400
        
        if density:
            try:
                density = float(density)
                if not 0.1 <= density <= 50:
                    return jsonify({'error': 'Density must be between 0.1 and 50mm'}), 400
            except ValueError:
                return jsonify({'error': 'Invalid density value'}), 400
        
        output_path = generator.generate_automatic_supports(
            input_path,
            overhang_angle=overhang_angle,
            density=density
        )
    elif mode == 'manual':
        # Get support points from request
        import json
        support_points_json = request.form.get('support_points', '[]')
        
        try:
            support_points = json.loads(support_points_json)
            if not isinstance(support_points, list):
                return jsonify({'error': 'Support points must be a JSON array'}), 400
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid support points JSON'}), 400
        
        output_path = generator.generate_manual_supports(
            input_path,
            support_points
        )
    elif mode == 'estimate':
        # Return estimation without generating supports
        analysis = generator.estimate_support_requirements(input_path)
        return jsonify(analysis)
    
    return send_file(output_path, as_attachment=True)


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
    logger.info("Starting SprueCrafter Backend API...")
    logger.info(f"Upload folder: {UPLOAD_FOLDER}")
    logger.info(f"Max file size: {app.config['MAX_CONTENT_LENGTH'] / (1024 * 1024):.0f}MB")
    app.run(host='127.0.0.1', port=5000, debug=True)
