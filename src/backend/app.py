"""
SprueCrafter Backend API
Main Flask application for 3D model processing and sprue generation
"""

from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
import sys
import tempfile
import traceback
import logging
from functools import wraps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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

app = Flask(__name__, static_folder='../web', static_url_path='')

# Configure CORS - allow Railway domains and specific localhost ports
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:5000",
            "http://localhost:8080",
            "http://localhost:8081",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5000",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:8081",
            "https://*.railway.app",
            "https://*.up.railway.app"
        ]
    }
})

# Configure upload folder
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', tempfile.mkdtemp())
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size

# Allowed file extensions
ALLOWED_3D_FORMATS = {
    'stl', 'obj', 'fbx', '3ds', 'ply', 'gltf', 'glb', 'dae'
}

ALLOWED_IMAGE_FORMATS = {
    'jpg', 'jpeg', 'png', 'bmp', 'tiff'
}

ALLOWED_EXTENSIONS = ALLOWED_3D_FORMATS | ALLOWED_IMAGE_FORMATS

# Default scale values
DEFAULT_SCALE = 1/35  # 1/35 scale for armor models


def allowed_file(filename, file_types='all'):
    """
    Check if file extension is allowed
    
    Args:
        filename: Name of the file to check
        file_types: Type of files to allow ('3d', 'image', or 'all')
    """
    if '.' not in filename:
        return False
    
    ext = filename.rsplit('.', 1)[1].lower()
    
    if file_types == '3d':
        return ext in ALLOWED_3D_FORMATS
    elif file_types == 'image':
        return ext in ALLOWED_IMAGE_FORMATS
    else:
        return ext in ALLOWED_EXTENSIONS


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
        'version': '1.0.0',
        'mode': 'web' if os.getenv('RAILWAY_ENVIRONMENT') else 'desktop'
    })


@app.route('/')
def index():
    """Serve the web UI"""
    # Check if web UI exists, otherwise return API info
    web_index = os.path.join(app.static_folder, 'index.html') if app.static_folder else None
    if web_index and os.path.exists(web_index):
        return send_from_directory(app.static_folder, 'index.html')
    else:
        return jsonify({
            'name': 'SprueCrafter API',
            'version': '1.0.0',
            'description': 'Professional 3D Model to Sprue Conversion Tool for Resin Printing',
            'docs': '/api/health',
            'endpoints': {
                'health': '/api/health',
                'convert': '/api/convert',
                'scale': '/api/scale',
                'separate': '/api/separate',
                'generate_sprue': '/api/generate-sprue',
                'transform': '/api/transform',
                'generate_supports': '/api/generate-supports',
                'photo_to_model': '/api/photo-to-model',
                'printer_profiles': '/api/printer-profiles',
                'connector_types': '/api/connector-types',
                'pro_subscribe': '/api/pro/subscribe',
                'pro_status': '/api/pro/status'
            }
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
    
    if not allowed_file(file.filename, '3d'):
        return jsonify({'error': 'File type not allowed. Must be a 3D model format.'}), 400
    
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
    
    if not allowed_file(file.filename, '3d'):
        return jsonify({'error': 'File type not allowed. Must be a 3D model format.'}), 400
    
    try:
        scale = float(request.form.get('scale', DEFAULT_SCALE))
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
    
    if not allowed_file(file.filename, '3d'):
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
    
    if not allowed_file(file.filename, '3d'):
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
        if not allowed_file(file.filename, 'image'):
            return jsonify({'error': f'File type not allowed: {file.filename}. Must be an image format.'}), 400
        
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
    
    if not allowed_file(file.filename, '3d'):
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
    
    if not allowed_file(file.filename, '3d'):
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
    Get available resin printer profiles - comprehensive industry database
    """
    profiles = {
        # Elegoo Printers - Mars Series
        'elegoo_mars_3': {
            'name': 'Elegoo Mars 3',
            'build_volume': {'x': 143.43, 'y': 89.6, 'z': 175}
        },
        'elegoo_mars_3_pro': {
            'name': 'Elegoo Mars 3 Pro',
            'build_volume': {'x': 143.43, 'y': 89.6, 'z': 175}
        },
        'elegoo_mars_4_ultra': {
            'name': 'Elegoo Mars 4 Ultra',
            'build_volume': {'x': 153.36, 'y': 77.76, 'z': 165}
        },
        'elegoo_mars_4_max': {
            'name': 'Elegoo Mars 4 Max',
            'build_volume': {'x': 196.608, 'y': 122.88, 'z': 150}
        },
        
        # Elegoo Saturn Series
        'elegoo_saturn': {
            'name': 'Elegoo Saturn',
            'build_volume': {'x': 192, 'y': 120, 'z': 200}
        },
        'elegoo_saturn_2': {
            'name': 'Elegoo Saturn 2',
            'build_volume': {'x': 218.88, 'y': 122.88, 'z': 250}
        },
        'elegoo_saturn_3': {
            'name': 'Elegoo Saturn 3',
            'build_volume': {'x': 218.88, 'y': 122.88, 'z': 250}
        },
        'elegoo_saturn_3_ultra': {
            'name': 'Elegoo Saturn 3 Ultra',
            'build_volume': {'x': 218.88, 'y': 122.88, 'z': 250}
        },
        'elegoo_saturn_4_ultra': {
            'name': 'Elegoo Saturn 4 Ultra',
            'build_volume': {'x': 218.88, 'y': 122.88, 'z': 220}
        },
        
        # Elegoo Jupiter Series
        'elegoo_jupiter': {
            'name': 'Elegoo Jupiter',
            'build_volume': {'x': 277.848, 'y': 156.096, 'z': 300}
        },
        'elegoo_jupiter_2': {
            'name': 'Elegoo Jupiter 2',
            'build_volume': {'x': 277.848, 'y': 156.096, 'z': 320}
        },
        
        # Anycubic Photon Series
        'anycubic_photon_mono_4k': {
            'name': 'Anycubic Photon Mono 4K',
            'build_volume': {'x': 132, 'y': 80, 'z': 165}
        },
        'anycubic_photon_m3': {
            'name': 'Anycubic Photon M3',
            'build_volume': {'x': 163.84, 'y': 102.4, 'z': 180}
        },
        'anycubic_photon_m3_plus': {
            'name': 'Anycubic Photon M3 Plus',
            'build_volume': {'x': 245.76, 'y': 197.12, 'z': 122}
        },
        'anycubic_photon_m3_premium': {
            'name': 'Anycubic Photon M3 Premium',
            'build_volume': {'x': 298.08, 'y': 164.16, 'z': 300}
        },
        'anycubic_photon_mono_x': {
            'name': 'Anycubic Photon Mono X',
            'build_volume': {'x': 192, 'y': 120, 'z': 245}
        },
        'anycubic_photon_mono_x_6k': {
            'name': 'Anycubic Photon Mono X 6K',
            'build_volume': {'x': 197.12, 'y': 122.88, 'z': 245}
        },
        'anycubic_photon_mono_x2': {
            'name': 'Anycubic Photon Mono X2',
            'build_volume': {'x': 198, 'y': 124, 'z': 245}
        },
        'anycubic_photon_d2': {
            'name': 'Anycubic Photon D2',
            'build_volume': {'x': 131.84, 'y': 73.73, 'z': 165}
        },
        
        # Phrozen Sonic Series
        'phrozen_sonic_mini_8k': {
            'name': 'Phrozen Sonic Mini 8K',
            'build_volume': {'x': 165, 'y': 72, 'z': 180}
        },
        'phrozen_sonic_mini_8k_s': {
            'name': 'Phrozen Sonic Mini 8K S',
            'build_volume': {'x': 165, 'y': 71.28, 'z': 180}
        },
        'phrozen_sonic_mighty_4k': {
            'name': 'Phrozen Sonic Mighty 4K',
            'build_volume': {'x': 200, 'y': 125, 'z': 220}
        },
        'phrozen_sonic_mighty_8k': {
            'name': 'Phrozen Sonic Mighty 8K',
            'build_volume': {'x': 218, 'y': 123, 'z': 235}
        },
        'phrozen_sonic_mega_8k': {
            'name': 'Phrozen Sonic Mega 8K',
            'build_volume': {'x': 330, 'y': 185, 'z': 400}
        },
        'phrozen_sonic_mega_8k_s': {
            'name': 'Phrozen Sonic Mega 8K S',
            'build_volume': {'x': 330, 'y': 185.76, 'z': 400}
        },
        
        # Creality Halot Series
        'creality_halot_one': {
            'name': 'Creality Halot One',
            'build_volume': {'x': 127, 'y': 80, 'z': 160}
        },
        'creality_halot_one_pro': {
            'name': 'Creality Halot One Pro',
            'build_volume': {'x': 127.31, 'y': 80.82, 'z': 160}
        },
        'creality_halot_lite': {
            'name': 'Creality Halot Lite',
            'build_volume': {'x': 127, 'y': 80, 'z': 160}
        },
        'creality_halot_sky': {
            'name': 'Creality Halot Sky',
            'build_volume': {'x': 192, 'y': 120, 'z': 200}
        },
        'creality_halot_mage': {
            'name': 'Creality Halot Mage',
            'build_volume': {'x': 228, 'y': 128, 'z': 230}
        },
        'creality_halot_mage_pro': {
            'name': 'Creality Halot Mage Pro',
            'build_volume': {'x': 228.096, 'y': 128.304, 'z': 230}
        },
        'creality_halot_max': {
            'name': 'Creality Halot Max',
            'build_volume': {'x': 298, 'y': 164, 'z': 340}
        },
        
        # Formlabs Form Series
        'formlabs_form_3': {
            'name': 'Formlabs Form 3',
            'build_volume': {'x': 145, 'y': 145, 'z': 185}
        },
        'formlabs_form_3_plus': {
            'name': 'Formlabs Form 3+',
            'build_volume': {'x': 145, 'y': 145, 'z': 185}
        },
        'formlabs_form_3l': {
            'name': 'Formlabs Form 3L',
            'build_volume': {'x': 200, 'y': 335, 'z': 300}
        },
        'formlabs_form_3b': {
            'name': 'Formlabs Form 3B',
            'build_volume': {'x': 145, 'y': 145, 'z': 185}
        },
        'formlabs_form_4': {
            'name': 'Formlabs Form 4',
            'build_volume': {'x': 200, 'y': 125, 'z': 210}
        },
        
        # Prusa Research
        'prusa_sl1s': {
            'name': 'Prusa SL1S',
            'build_volume': {'x': 127, 'y': 80, 'z': 150}
        },
        
        # Longer Orange Series
        'longer_orange_30': {
            'name': 'Longer Orange 30',
            'build_volume': {'x': 120, 'y': 68, 'z': 170}
        },
        'longer_orange_4k': {
            'name': 'Longer Orange 4K',
            'build_volume': {'x': 192, 'y': 120, 'z': 245}
        },
        
        # Qidi Tech
        'qidi_shadow_6_pro': {
            'name': 'Qidi Shadow 6 Pro',
            'build_volume': {'x': 131.56, 'y': 73.6, 'z': 160}
        },
        
        # Peopoly
        'peopoly_phenom': {
            'name': 'Peopoly Phenom',
            'build_volume': {'x': 276, 'y': 155, 'z': 400}
        },
        'peopoly_phenom_l': {
            'name': 'Peopoly Phenom L',
            'build_volume': {'x': 345, 'y': 194, 'z': 400}
        },
        'peopoly_phenom_noir': {
            'name': 'Peopoly Phenom Noir',
            'build_volume': {'x': 276, 'y': 155, 'z': 400}
        },
        
        # Voxelab
        'voxelab_proxima_8_1': {
            'name': 'Voxelab Proxima 8.1',
            'build_volume': {'x': 192, 'y': 120, 'z': 245}
        },
        
        # Uniformation
        'uniformation_gk_two': {
            'name': 'Uniformation GKtwo',
            'build_volume': {'x': 192, 'y': 120, 'z': 200}
        },
        
        # Custom option
        'custom': {
            'name': 'Custom Printer',
            'build_volume': {'x': 192, 'y': 120, 'z': 245}
        }
    }
    return jsonify(profiles)


# Pro subscription endpoints
@app.route('/api/pro/subscribe', methods=['POST'])
@handle_errors
def subscribe_pro():
    """
    Create a Stripe checkout session for Pro subscription
    """
    data = request.get_json()
    
    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
    
    email = data.get('email')
    name = data.get('name')
    
    try:
        from pro_stripe import create_pro_checkout_session
        result = create_pro_checkout_session(email, name)
        return jsonify(result)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Pro subscription error: {str(e)}")
        return jsonify({'error': 'Failed to create checkout session'}), 500


@app.route('/api/pro/webhook', methods=['POST'])
def stripe_webhook():
    """
    Handle Stripe webhook events
    """
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    if not sig_header:
        return jsonify({'error': 'Missing signature'}), 400
    
    try:
        from pro_stripe import handle_webhook
        handle_webhook(payload, sig_header)
        return jsonify({'status': 'success'})
    except ValueError as e:
        logger.error(f"Webhook error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return jsonify({'error': 'Webhook processing failed'}), 500


@app.route('/api/pro/status', methods=['GET'])
@handle_errors
def pro_status():
    """
    Check Pro subscription status
    """
    from pro_auth import optional_pro_auth, g
    
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({
            'is_pro': False,
            'message': 'No API key provided'
        })
    
    from pro_auth import get_pro_user
    user = get_pro_user(api_key)
    
    if user:
        return jsonify({
            'is_pro': True,
            'name': user.get('name'),
            'email': user.get('email'),
            'plan': user.get('plan')
        })
    else:
        return jsonify({
            'is_pro': False,
            'message': 'Invalid or expired API key'
        })


if __name__ == '__main__':
    # Get configuration from environment variables
    host = os.getenv('HOST', '127.0.0.1')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    logger.info("Starting SprueCrafter Backend API...")
    logger.info(f"Host: {host}")
    logger.info(f"Port: {port}")
    logger.info(f"Upload folder: {UPLOAD_FOLDER}")
    logger.info(f"Max file size: {app.config['MAX_CONTENT_LENGTH'] / (1024 * 1024):.0f}MB")
    logger.info("Free access enabled - no login required for basic features")
    logger.info("Pro features available with subscription via /api/pro/subscribe")
    
    # Check if running on Railway
    if os.getenv('RAILWAY_ENVIRONMENT'):
        logger.info(f"Running on Railway environment: {os.getenv('RAILWAY_ENVIRONMENT')}")
    
    app.run(host=host, port=port, debug=debug)
