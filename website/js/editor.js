/**
 * SprueCrafter Editor (SaaS Version)
 * Ported from Electron renderer.js for Web
 */

// Configuration
const API_BASE = '/api'; // Relative path for proxy/backend

// State
let currentFile = null;
let currentModel = null;
let scene, camera, renderer, controls, transformControls, printerPlate;
const CANVAS_ID = 'viewer-canvas';

// 3D Dependencies (Allocated from global window.THREE)
const initThree = () => {
    if (!window.THREE) {
        console.error("Three.js not loaded");
        return false;
    }
    return true;
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("SprueCrafter Web Editor Initializing...");
    
    // Auth Check
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    if (initThree()) {
        init3DViewer();
        initializeTools();
        initializeUpload();
        loadInitialFile(); // Check if redirected from dashboard
    }
});

// --- 3D Viewer ---

function init3DViewer() {
    const canvas = document.getElementById(CANVAS_ID);
    const container = canvas.parentElement;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    // Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(200, 200, 200);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);

    // Printer Plate
    createPrinterPlate(192, 120, 245);

    // Window Resize
    window.addEventListener('resize', onWindowResize);
    
    // Animation Loop
    animate();
}

function createPrinterPlate(width, depth, height) {
    if (printerPlate) scene.remove(printerPlate);
    printerPlate = new THREE.Group();

    // Grid
    const grid = new THREE.GridHelper(Math.max(width, depth) * 1.5, 20, 0x333333, 0x111111);
    printerPlate.add(grid);

    // Volume Box
    const boxGeo = new THREE.BoxGeometry(width, height, depth);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.2 });
    const boxLines = new THREE.LineSegments(edges, lineMat);
    boxLines.position.y = height / 2;
    printerPlate.add(boxLines);

    scene.add(printerPlate);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    const canvas = document.getElementById(CANVAS_ID);
    const container = canvas.parentElement;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// --- File Handling ---

async function handleFileUpload(file) {
    currentFile = file;
    updateStatus('Loading file...', 'info');

    try {
        const url = URL.createObjectURL(file);
        const fileName = file.name.toLowerCase();
        
        let loader;
        if (fileName.endsWith('.obj')) loader = new THREE.OBJLoader();
        else loader = new THREE.STLLoader();

        if (currentModel) scene.remove(currentModel);

        const geometry = await new Promise((resolve, reject) => {
            loader.load(url, (geom) => resolve(geom), undefined, reject);
        });

        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00f2ff, 
            specular: 0x111111, 
            shininess: 200 
        });

        if (geometry.isBufferGeometry) {
             geometry.center();
             currentModel = new THREE.Mesh(geometry, material);
        } else {
            // OBJ group
            currentModel = geometry;
            currentModel.traverse(child => {
                if(child.isMesh) child.material = material;
            });
        }
        
        // Position on plate
        const box = new THREE.Box3().setFromObject(currentModel);
        const size = box.getSize(new THREE.Vector3());
        currentModel.position.y = size.y / 2;

        scene.add(currentModel);
        
        // Fit camera
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(maxDim * 2, maxDim * 2, maxDim * 2);
        controls.target.set(0, size.y / 2, 0);

        updateStatus('Model loaded', 'success');
        
    } catch (err) {
        console.error(err);
        updateStatus('Error loading model', 'error');
    }
}

function initializeUpload() {
    // Check for file from Dashboard redirect
    // (In a real app, we'd use a shared state manager or re-fetch, here we simulate)
}

function loadInitialFile() {
    // Simulation: Create a default cube if no file
    // In production, checking sessionStorage for file data from dashboard would be better
}

// --- Tools Implementation ---

function initializeTools() {
    // 1. Separate
    const separateBtn = document.getElementById('separate-btn');
    if(separateBtn) separateBtn.addEventListener('click', async () => {
        if(!currentFile) return alert('Upload a file first');
        
        updateStatus('Separating parts...', 'info');
        const fd = new FormData();
        fd.append('file', currentFile);
        
        try {
            const res = await axios.post(`${API_BASE}/separate`, fd);
            alert(`Found ${res.data.total_parts} parts! Check console for details.`);
            console.log(res.data);
            updateStatus('Separation complete', 'success');
        } catch (e) {
            console.error(e);
            updateStatus('Separation failed', 'error');
        }
    });

    // 2. Supports
    const supportBtn = document.getElementById('generate-supports-btn');
    if(supportBtn) supportBtn.addEventListener('click', async () => {
        if(!currentFile) return alert('Upload a file first');
        
        const density = prompt("Support Density (0.1 - 50):", "1.0");
        const angle = prompt("Overhang Angle (0-90):", "45");
        
        updateStatus('Generating supports...', 'info');
        const fd = new FormData();
        fd.append('file', currentFile);
        fd.append('density', density);
        fd.append('overhang_angle', angle);
        fd.append('mode', 'automatic');

        try {
            const res = await axios.post(`${API_BASE}/generate-supports`, fd, {
                responseType: 'blob'
            });
            downloadBlob(res.data, 'supports.stl');
            updateStatus('Supports generated', 'success');
        } catch (e) {
             updateStatus('Support generation failed', 'error');
        }
    });

    // 3. Sprue
    const sprueBtn = document.getElementById('generate-sprue-btn');
    if(sprueBtn) sprueBtn.addEventListener('click', async () => {
        if(!currentFile) return alert('Upload a file first');
        
        updateStatus('Generating sprue...', 'info');
        const fd = new FormData();
        fd.append('file', currentFile);
        
        try {
            const res = await axios.post(`${API_BASE}/generate-sprue`, fd, {
                 responseType: 'blob'
            });
            downloadBlob(res.data, 'sprue.stl');
            updateStatus('Sprue generated', 'success');
        } catch (e) {
            updateStatus('Sprue generation failed', 'error');
        }
    });
    
    // 4. Transform (Rotate Z 90)
    const rotateBtn = document.getElementById('rotate-model-btn');
    if(rotateBtn) rotateBtn.addEventListener('click', async () => {
        if(!currentFile) return alert('Upload a file first');
        
        updateStatus('Rotating...', 'info');
        const fd = new FormData();
        fd.append('file', currentFile);
        fd.append('operation', 'rotate');
        fd.append('axis', 'z');
        fd.append('angle', '90');
        
        try {
            const res = await axios.post(`${API_BASE}/transform`, fd, {
                responseType: 'blob'
            });
            
            // Reload viewer with new file
            const newFile = new File([res.data], "rotated.stl", { type: "model/stl" });
            handleFileUpload(newFile);
            
            updateStatus('Rotated 90 degrees', 'success');
        } catch (e) {
            updateStatus('Rotation failed', 'error');
        }
    });

    // File Input Helper
    const fileInput = document.getElementById('file-input');
    if(fileInput) fileInput.addEventListener('change', (e) => {
        if(e.target.files.length) handleFileUpload(e.target.files[0]);
    });
}

// --- Utilities ---

function updateStatus(msg, type) {
    const el = document.getElementById('status-bar');
    if (el) {
        el.textContent = msg;
        el.style.color = type === 'error' ? '#ff4444' : '#00f2ff';
        
        // Reset after 3s
        setTimeout(() => {
            el.textContent = 'Ready';
            el.style.color = '#888';
        }, 5000);
    }
}

function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Expose handleFileUpload globally for dashboard redirection
window.handleFileUpload = handleFileUpload;
