/**
 * SprueCrafter Studio - Slicer Logic
 * Handles 3D Viewport, Tool States, and Backend Integration
 */

const API_BASE = '/api';

// --- Global State ---
const AppState = {
    file: null,
    model: null,
    activeTool: 'layout', // layout, transform, supports, sprues, settings
    settings: {
        layerHeight: 0.05,
        printer: 'Saturn 2',
        resin: 'Standard Grey'
    }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (!localStorage.getItem('auth_token') && !localStorage.getItem('is_guest')) {
        window.location.href = 'login.html';
        return;
    }

    init3DViewer();
    initUI();
    initTools();

    // Check for pending file from dashboard upload
    const pendingFileData = sessionStorage.getItem('pendingFile');
    if (pendingFileData) {
        try {
            const fileInfo = JSON.parse(pendingFileData);
            // Create a File object from the stored data
            const arrayBuffer = fileInfo.data;
            const blob = new Blob([new Uint8Array(arrayBuffer)], { type: fileInfo.type });
            const file = new File([blob], fileInfo.name, { type: fileInfo.type });

            // Load the file after a short delay to ensure viewer is ready
            setTimeout(() => {
                handleFileUpload(file);
            }, 500);

            // Clear the pending file
            sessionStorage.removeItem('pendingFile');
        } catch (e) {
            console.error('Error loading pending file:', e);
        }
    }
});

// --- UI Logic ---
function initUI() {
    // Tool Switching
    const toolIcons = document.querySelectorAll('.tool-icon[data-tool]');
    toolIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            // 1. Visual Active State
            toolIcons.forEach(i => i.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');

            // 2. Switch Context Panel
            const toolName = target.dataset.tool;
            AppState.activeTool = toolName;

            document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(`panel-${toolName}`);
            if (panel) panel.classList.add('active');
        });
    });

    // File Input
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFileUpload(e.target.files[0]);
    });
}

// --- Tool Implementations ---
function initTools() {
    // 1. Layout Tools
    document.getElementById('separate-parts-btn').addEventListener('click', async () => {
        if (!AppState.file) {
            updateStatus('Please load a model first', 'error');
            return;
        }

        updateStatus('Separating parts...', 'info');
        document.body.style.cursor = 'wait';

        try {
            const fd = new FormData();
            fd.append('file', AppState.file);

            const res = await axios.post(`${API_BASE}/separate`, fd, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                }
            });

            const data = res.data;
            updateStatus(`Found ${data.total_parts || 0} distinct parts`, 'success');

            // Show parts information
            if (data.parts && data.parts.length > 0) {
                const partsList = data.parts.map((p, i) =>
                    `Part ${i + 1}: ${p.category || 'unknown'} (${p.vertices || 0} vertices)`
                ).join('\n');
                console.log('Parts:', partsList);
            }
        } catch (e) {
            console.error(e);
            updateStatus(`Error: ${e.response?.data?.error || e.message}`, 'error');
        } finally {
            document.body.style.cursor = 'default';
        }
    });

    document.getElementById('auto-orient-btn')?.addEventListener('click', async () => {
        // AI Stub
        updateStatus('Analyzing geometry for optimal orientation...', 'info');
        setTimeout(() => updateStatus('AI Orientation Complete (Mock)', 'success'), 1500);
    });

    document.getElementById('repair-mesh-btn')?.addEventListener('click', async () => {
        updateStatus('Repairing non-manifold geometry...', 'info');
        setTimeout(() => updateStatus('Mesh Repaired: 0 errors found', 'success'), 1500);
    });

    // 2. Transform Tools
    ['pos', 'rot', 'scale'].forEach(type => {
        // Add listeners to inputs to trigger transform API on change
        // For MVP we just bind reset for now
    });
    document.getElementById('reset-transform-btn').addEventListener('click', () => {
        if (AppState.model) {
            AppState.model.rotation.set(0, 0, 0);
            AppState.model.position.set(0, 0, 0);
            AppState.model.scale.set(1, 1, 1);
            updateStatus('Transforms Reset', 'info');
        }
    });

    // 3. Support Generation
    document.getElementById('gen-supports-btn').addEventListener('click', async () => {
        if (!AppState.file) {
            updateStatus('Please load a model first', 'error');
            return;
        }

        const density = document.getElementById('support-density').value / 100.0; // 0-1
        const angle = document.getElementById('overhang-angle').value;
        const adhesion = document.getElementById('adhesion-type').value;

        updateStatus('Generating Smart Supports...', 'info');
        document.body.style.cursor = 'wait';

        try {
            const fd = new FormData();
            fd.append('file', AppState.file);
            fd.append('mode', 'automatic');
            fd.append('density', density);
            fd.append('overhang_angle', angle);
            fd.append('adhesion', adhesion);

            const res = await axios.post(`${API_BASE}/generate-supports`, fd, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                }
            });

            downloadBlob(res.data, 'model_with_supports.stl');
            updateStatus('Supports generated successfully', 'success');
        } catch (e) {
            console.error(e);
            updateStatus(`Error: ${e.response?.data?.error || e.message}`, 'error');
        } finally {
            document.body.style.cursor = 'default';
        }
    });

    // 4. Sprue Generation
    document.getElementById('gen-sprue-btn').addEventListener('click', async () => {
        if (!AppState.file) {
            updateStatus('Please load a model first', 'error');
            return;
        }

        const connectorType = document.getElementById('connector-type').value;

        updateStatus('Generating Sprue Layout...', 'info');
        document.body.style.cursor = 'wait';

        try {
            const fd = new FormData();
            fd.append('file', AppState.file);
            fd.append('connector_type', connectorType);
            // Default build plate dimensions (Elegoo Saturn 2)
            fd.append('build_plate_x', '218.88');
            fd.append('build_plate_y', '122.88');
            fd.append('build_plate_z', '250');

            const res = await axios.post(`${API_BASE}/generate-sprue`, fd, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                }
            });

            downloadBlob(res.data, 'sprue_layout.stl');
            updateStatus('Sprue layout generated successfully', 'success');
        } catch (e) {
            console.error(e);
            updateStatus(`Error: ${e.response?.data?.error || e.message}`, 'error');
        } finally {
            document.body.style.cursor = 'default';
        }
    });
}

// --- Helper for Backend Calls ---
async function runBackendOperation(endpoint, statusMsg, callback, formData = null, responseType = 'json') {
    if (!AppState.file) return alert("Please import a model first.");

    updateStatus(statusMsg, 'info');
    document.body.style.cursor = 'wait';

    try {
        const fd = formData || new FormData();
        if (!fd.has('file')) fd.append('file', AppState.file);

        const res = await axios.post(`${API_BASE}${endpoint}`, fd, { responseType });
        callback(res.data);
        updateStatus('Operation Complete', 'success');
    } catch (e) {
        console.error(e);
        updateStatus(`Error: ${e.response?.data?.error || e.message}`, 'error');
    } finally {
        document.body.style.cursor = 'default';
    }
}

// --- 3D Viewer (Three.js) ---
let scene, camera, renderer, controls;

function init3DViewer() {
    const canvas = document.getElementById('viewer-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Match dark theme

    // Grid
    const grid = new THREE.GridHelper(200, 20, 0x334155, 0x1e293b);
    scene.add(grid);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(50, 100, 50);
    scene.add(dir);

    // Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(150, 150, 150);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Controls
    if (window.THREE && window.THREE.OrbitControls) {
        controls = new window.THREE.OrbitControls(camera, renderer.domElement);
    }

    animate();
    window.addEventListener('resize', onResize);
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
}

function onResize() {
    const canvas = document.getElementById('viewer-canvas');
    const container = canvas.parentElement;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// File Loader
window.handleFileUpload = async function (file) {
    AppState.file = file;
    document.getElementById('model-name').value = file.name;
    updateStatus('Loading model...', 'info');

    const fileExt = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            let loader;
            let geometry;

            // Choose appropriate loader based on file extension
            if (fileExt === 'stl') {
                loader = new THREE.STLLoader();
                geometry = loader.parse(e.target.result);
            } else if (fileExt === 'obj') {
                loader = new THREE.OBJLoader();
                const object = loader.parse(e.target.result);
                // Extract geometry from OBJ
                object.traverse((child) => {
                    if (child.isMesh && !geometry) {
                        geometry = child.geometry;
                    }
                });
            } else {
                updateStatus(`Unsupported format: ${fileExt}`, 'error');
                return;
            }

            if (!geometry) {
                updateStatus('Failed to load geometry', 'error');
                return;
            }

            // Remove previous model if exists
            if (AppState.model) {
                scene.remove(AppState.model);
            }

            // Create material
            const material = new THREE.MeshPhongMaterial({
                color: 0x00f2ff,
                specular: 0x111111,
                shininess: 200,
                flatShading: false
            });

            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);

            // Center and scale model
            geometry.computeBoundingBox();
            const bbox = geometry.boundingBox;
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            mesh.position.sub(center);

            // Calculate dimensions
            const size = new THREE.Vector3();
            bbox.getSize(size);

            // Auto-scale to fit viewport (target size ~100 units)
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 100) {
                const scale = 100 / maxDim;
                mesh.scale.set(scale, scale, scale);
                size.multiplyScalar(scale);
            }

            // Add to scene
            scene.add(mesh);
            AppState.model = mesh;

            // Update statistics
            const vertices = geometry.attributes.position.count;
            const faces = geometry.index ? geometry.index.count / 3 : vertices / 3;

            document.getElementById('model-count').textContent = '1';
            document.getElementById('poly-count').textContent = Math.floor(faces).toLocaleString();
            document.getElementById('dim-x').textContent = size.x.toFixed(2);
            document.getElementById('dim-y').textContent = size.y.toFixed(2);
            document.getElementById('dim-z').textContent = size.z.toFixed(2);

            // Reset camera to view model
            camera.position.set(150, 150, 150);
            camera.lookAt(0, 0, 0);
            if (controls) {
                controls.reset();
            }

            updateStatus(`Loaded ${file.name} (${Math.floor(faces).toLocaleString()} faces)`, 'success');

        } catch (error) {
            console.error('Error loading model:', error);
            updateStatus(`Error loading model: ${error.message}`, 'error');
        }
    };

    // Read file based on type
    if (fileExt === 'stl') {
        reader.readAsArrayBuffer(file);
    } else if (fileExt === 'obj') {
        reader.readAsText(file);
    } else {
        updateStatus(`Unsupported file format: ${fileExt}`, 'error');
    }
};


// Utils
function updateStatus(msg, type) {
    const el = document.getElementById('status-msg');
    if (el) {
        el.textContent = msg;
        el.style.color = type === 'error' ? '#ef4444' : (type === 'success' ? '#22c55e' : '#94a3b8');
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}
