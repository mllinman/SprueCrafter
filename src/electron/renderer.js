/**
 * SprueCrafter Renderer
 * Handles UI interactions, API communication, and 3D Visualization
 */

// Environment detection and safe requires
let ipcRenderer,
  axios,
  FormData,
  fs,
  path,
  THREE,
  OrbitControls,
  STLLoader,
  OBJLoader,
  TransformControls;

function initializeDependencies() {
  try {
    if (typeof require !== 'undefined') {
      try {
        ipcRenderer = require('electron').ipcRenderer;
        axios = require('axios');
        FormData = require('form-data');
        fs = require('fs');
        path = require('path');
        THREE = require('three');
        OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls;
        STLLoader = require('three/examples/jsm/loaders/STLLoader').STLLoader;
        OBJLoader = require('three/examples/jsm/loaders/OBJLoader').OBJLoader;
        TransformControls =
          require('three/examples/jsm/controls/TransformControls').TransformControls;
      } catch (e) {
        console.warn('Some Node modules failed to load, checking globals.', e);
      }
    }
  } catch (err) {
    console.error('Critical dependency loading failed:', err);
  }

  // Web mode fallbacks (using globals from script tags)
  if (!axios && typeof window.axios !== 'undefined') axios = window.axios;
  if (!THREE && typeof window.THREE !== 'undefined') THREE = window.THREE;

  if (THREE) {
    if (!OrbitControls) OrbitControls = THREE.OrbitControls;
    if (!STLLoader) STLLoader = THREE.STLLoader;
    if (!OBJLoader) OBJLoader = THREE.OBJLoader;
    if (!TransformControls) TransformControls = THREE.TransformControls;
  }
}

initializeDependencies();

const API_BASE = 'http://127.0.0.1:5000/api';

// Responsive breakpoint constant (matches CSS media query)
const MOBILE_BREAKPOINT = 768;

let currentFile = null;
let currentFiles = [];

// 3D Viewer state
let scene, camera, renderer, controls, transformControls, printerPlate, currentModel;
const CANVAS_ID = 'viewer-canvas';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  console.log('SprueCrafter Pro Initializing...');

  // Navigation MUST be first to ensure UI responsiveness even if 3D fails
  initializeNavigation();
  initializeMarketplace();
  initializeWorkspaceSettings();

  initializeUpload();
  initializeConvert();
  initializeScale();
  initializeSeparate();
  initializeTransform();
  initializeSupports();
  initializeSprue();
  initializePhoto();
  initializePrinterProfiles(); // Added this call
  initializeNotes(); // New notes functionality
  initializeBoundsWarning(); // New bounds checking
  checkBackendStatus();

  // Initialize 3D Viewer (only if THREE is available)
  if (THREE) {
    init3DViewer();
  } else {
    updateStatus('3D Viewer disabled (Three.js not found)', 'error');
  }

  // Check backend status periodically
  setInterval(checkBackendStatus, 10000);
});

// Settings functionality (renamed to initializeWorkspaceSettings and moved)
// function initializeSettings() {
//   const settingsBtn = document.getElementById('settings-btn');
//   if (settingsBtn) {
//     settingsBtn.addEventListener('click', () => {
//       alert("Settings panel coming soon! Running in " + (typeof require !== 'undefined' ? "Desktop" : "Web") + " mode.");
//     });
//   }
// }

// Navigation
function initializeNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.querySelector('.sidebar');

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      // Update active states
      navButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      tabContents.forEach((tab) => {
        tab.classList.remove('active');
        if (tab.id === `${tabId}-tab`) {
          tab.classList.add('active');
        }
      });

      // Close mobile menu after navigation on small screens
      if (window.innerWidth <= MOBILE_BREAKPOINT && sidebar) {
        sidebar.classList.remove('active');
        if (mobileMenuToggle) {
          mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Mobile menu toggle
  if (mobileMenuToggle && sidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      // Update aria-expanded for accessibility
      const isExpanded = sidebar.classList.contains('active');
      mobileMenuToggle.setAttribute('aria-expanded', isExpanded.toString());
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (
        window.innerWidth <= MOBILE_BREAKPOINT &&
        sidebar.classList.contains('active') &&
        !sidebar.contains(e.target) &&
        !mobileMenuToggle.contains(e.target)
      ) {
        sidebar.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// 3D Viewer Implementation
function init3DViewer() {
  const canvas = document.getElementById(CANVAS_ID);
  const container = canvas.parentElement;

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    2000
  );
  camera.position.set(200, 200, 200);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 10;
  controls.maxDistance = 1000;
  controls.maxPolarAngle = Math.PI / 1.5;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x00f2ff, 0.5);
  pointLight.position.set(-100, 200, -100);
  scene.add(pointLight);

  // Printer Plate (Build Volume Visualization)
  createPrinterPlate(192, 120, 245); // Default Saturn size

  // Handle resize
  window.addEventListener('resize', onWindowResize);

  // Extra controls from UI
  document.getElementById('reset-view-btn').addEventListener('click', () => {
    controls.reset();
    camera.position.set(200, 200, 200);
  });

  document.getElementById('zoom-in-btn').addEventListener('click', () => {
    camera.position.multiplyScalar(0.9);
  });

  document.getElementById('zoom-out-btn').addEventListener('click', () => {
    camera.position.multiplyScalar(1.1);
  });

  // Transform Controls
  if (TransformControls) {
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('change', () => renderer.render(scene, camera));
    transformControls.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value;
    });
    scene.add(transformControls);
  }

  animate();
}

// Workspace customization
function initializeWorkspaceSettings() {
  const colorPicker = document.getElementById('workspace-color-picker');
  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      if (printerPlate) {
        printerPlate.material.color.set(e.target.value);
      }
    });
  }

  // Transform Modes
  const modes = ['translate', 'rotate', 'scale'];
  modes.forEach((mode) => {
    const btn = document.getElementById(`mode-${mode}`);
    if (btn) {
      btn.addEventListener('click', () => {
        if (transformControls) {
          transformControls.setMode(mode);
          modes.forEach((m) => document.getElementById(`mode-${m}`).classList.remove('active'));
          btn.classList.add('active');
        }
      });
    }
  });

  // Share with Friends
  const shareBtn = document.getElementById('share-model-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const email = prompt("Enter friend's email to share this part:");
      if (email) {
        axios
          .post(`${API_BASE}/share/friends`, { emails: [email] })
          .then(() => alert('Shared successfully!'))
          .catch(() => alert('Pro subscription required to share assets.'));
      }
    });
  }

  // Upgrade to Pro button in Settings tab
  const upgradeProBtn = document.getElementById('upgrade-pro-btn');
  if (upgradeProBtn) {
    upgradeProBtn.addEventListener('click', () => {
      // Trigger the same Pro subscription flow as the main pro-btn
      const proBtn = document.getElementById('pro-btn');
      if (proBtn) {
        proBtn.click();
      }
    });
  }
}

function createPrinterPlate(width, depth, height) {
  if (printerPlate) scene.remove(printerPlate);

  printerPlate = new THREE.Group();

  // Grid
  const grid = new THREE.GridHelper(Math.max(width, depth) * 1.5, 20, 0x333333, 0x111111);
  printerPlate.add(grid);

  // Plate surface
  const plateGeom = new THREE.BoxGeometry(width, 2, depth);
  const plateMat = new THREE.MeshPhongMaterial({
    color: 0x222222,
    transparent: true,
    opacity: 0.8,
    shininess: 100
  });
  const plateMesh = new THREE.Mesh(plateGeom, plateMat);
  plateMesh.position.y = -1;
  printerPlate.add(plateMesh);

  // Frame/Volume outline
  const boxGeom = new THREE.BoxGeometry(width, height, depth);
  const edges = new THREE.EdgesGeometry(boxGeom);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.2 });
  const boxLines = new THREE.LineSegments(edges, lineMat);
  boxLines.position.y = height / 2;
  printerPlate.add(boxLines);

  scene.add(printerPlate);

  // Update build plate reference for bounds checking
  updateBuildPlateReference(width, depth, height);

  // Lock camera to build plate center and adjust distance based on size
  lockCameraToBuildPlate(width, depth, height);
}

function lockCameraToBuildPlate(width, depth, height) {
  if (!camera || !controls) return;

  // Calculate the optimal camera distance based on build volume
  // Use the largest dimension to ensure the entire build volume is visible
  const maxDimension = Math.max(width, depth, height);
  const fov = camera.fov * (Math.PI / 180); // Convert to radians
  const cameraDistance = (maxDimension / Math.tan(fov / 2)) * 1.5; // 1.5x for comfortable view

  // Set camera target to the center of the build plate (at mid-height)
  const targetPosition = new THREE.Vector3(0, height / 2, 0);
  controls.target.copy(targetPosition);

  // Position camera at an optimal viewing angle (45 degrees elevation, 45 degrees azimuth)
  const angle = Math.PI / 4; // 45 degrees
  const cameraX = cameraDistance * Math.cos(angle);
  const cameraY = cameraDistance * 0.7; // Slightly above center
  const cameraZ = cameraDistance * Math.sin(angle);

  // Animate camera movement for smooth transition
  animateCameraToPosition(new THREE.Vector3(cameraX, cameraY, cameraZ), targetPosition);
}

function animateCameraToPosition(targetPos, targetLookAt, duration = 1000) {
  if (!camera || !controls) return;

  const startPos = camera.position.clone();
  const startLookAt = controls.target.clone();
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-in-out function for smooth animation
    const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Interpolate camera position
    camera.position.lerpVectors(startPos, targetPos, eased);

    // Interpolate look-at target
    controls.target.lerpVectors(startLookAt, targetLookAt, eased);
    controls.update();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
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

async function loadModelToViewer(fileSource) {
  let filePath =
    typeof fileSource === 'string'
      ? fileSource
      : fileSource.path || URL.createObjectURL(fileSource);
  const fileName = typeof fileSource === 'string' ? path.basename(fileSource) : fileSource.name;
  const ext = fileName.split('.').pop().toLowerCase();

  updateStatus(`Loading ${fileName}...`, 'info');

  if (currentModel) scene.remove(currentModel);

  try {
    const loader = ext === 'obj' ? new OBJLoader() : new STLLoader();
    let arrayBuffer;

    if (fs && typeof fileSource === 'string') {
      // Desktop mode with real path
      const buffer = fs.readFileSync(fileSource);
      arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } else {
      // Web mode or Blob
      const response = await fetch(filePath);
      arrayBuffer = await response.arrayBuffer();
    }

    let geometry;
    let material = new THREE.MeshPhongMaterial({
      color: 0x00f2ff,
      specular: 0x111111,
      shininess: 200
    });

    if (ext === '.obj') {
      const text = new TextDecoder().decode(arrayBuffer);
      const group = loader.parse(text);
      currentModel = group;

      // Apply professional material to all children
      group.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
        }
      });
    } else {
      geometry = loader.parse(arrayBuffer);
      geometry.center();
      currentModel = new THREE.Mesh(geometry, material);
    }

    // Position model on plate
    const box = new THREE.Box3().setFromObject(currentModel);
    const size = box.getSize(new THREE.Vector3());
    currentModel.position.y = size.y / 2;

    scene.add(currentModel);

    // Attach transform controls
    if (transformControls) {
      transformControls.attach(currentModel);
    }

    // Check model bounds against build plate
    checkModelBounds(currentModel);

    // Lock camera to model
    lockCameraToObject(currentModel);

    updateStatus('Model loaded in viewport', 'success');
  } catch (error) {
    console.error('Loader error:', error);
    updateStatus(`Error loading model: ${error.message}`, 'error');
  }
}

// Upload functionality
function initializeUpload() {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');

  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--accent-primary)';
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = 'var(--border-color)';
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--border-color)';

    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });
}

function handleFileUpload(file) {
  currentFile = file;

  const fileInfo = document.getElementById('file-info');
  const fileDetails = document.getElementById('file-details');

  fileDetails.innerHTML = `
    <div>
      <label>Filename</label>
      <span>${file.name}</span>
    </div>
    <div>
      <label>Size</label>
      <span>${formatFileSize(file.size)}</span>
    </div>
  `;

  fileInfo.classList.remove('hidden');
  updateStatus('File loaded successfully', 'success');

  // Load into 3D viewer (pass the whole file object)
  loadModelToViewer(file);
}

// Convert functionality
function initializeConvert() {
  const convertBtn = document.getElementById('convert-btn');

  convertBtn.addEventListener('click', async () => {
    if (!currentFile) {
      showStatus('convert-status', 'Please upload a file first', 'error');
      return;
    }

    const targetFormat = document.getElementById('target-format').value;

    try {
      showStatus('convert-status', 'Converting file...', 'info');
      convertBtn.disabled = true;

      const fd = new (FormData || window.FormData)();
      fd.append('file', currentFile);
      fd.append('format', targetFormat);

      const response = await axios.post(`${API_BASE}/convert`, fd, {
        headers: fd.getHeaders ? fd.getHeaders() : {},
        responseType: 'arraybuffer'
      });

      if (ipcRenderer) {
        // Desktop Mode
        const savePath = await ipcRenderer.invoke(
          'save-file',
          `${currentFile.name.split('.')[0]}_converted.${targetFormat}`
        );

        if (savePath) {
          fs.writeFileSync(savePath, Buffer.from(response.data));
          showStatus('convert-status', `File converted and saved`, 'success');
          if (['stl', 'obj'].includes(targetFormat)) {
            loadModelToViewer(savePath);
          }
        }
      } else {
        // Web Mode - Download
        downloadBlob(response.data, `${currentFile.name.split('.')[0]}_converted.${targetFormat}`);
        showStatus('convert-status', 'Conversion complete (Downloaded)', 'success');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      showStatus('convert-status', `Error: ${error.message}`, 'error');
    } finally {
      convertBtn.disabled = false;
    }
  });
}

// Scale functionality
function initializeScale() {
  const scaleBtn = document.getElementById('scale-btn');
  const scaleSelect = document.getElementById('scale-select');
  const customScaleGroup = document.getElementById('custom-scale-group');

  scaleSelect.addEventListener('change', () => {
    if (scaleSelect.value === 'custom') {
      customScaleGroup.classList.remove('hidden');
    } else {
      customScaleGroup.classList.add('hidden');
    }
  });

  scaleBtn.addEventListener('click', async () => {
    if (!currentFile) {
      showStatus('scale-status', 'Please upload a file first', 'error');
      return;
    }

    let scale = scaleSelect.value;
    if (scale === 'custom') {
      scale = document.getElementById('custom-scale').value;
      if (!scale) {
        showStatus('scale-status', 'Please enter a custom scale value', 'error');
        return;
      }
    }

    const unit = document.getElementById('unit-select').value;

    try {
      showStatus('scale-status', 'Scaling model...', 'info');
      scaleBtn.disabled = true;

      const fd = new (FormData || window.FormData)();
      fd.append('file', currentFile);
      fd.append('scale', scale);
      fd.append('unit', unit);

      const response = await axios.post(`${API_BASE}/scale`, fd, {
        headers: fd.getHeaders ? fd.getHeaders() : {},
        responseType: 'arraybuffer'
      });

      if (ipcRenderer) {
        const savePath = await ipcRenderer.invoke(
          'save-file',
          `${currentFile.name.split('.')[0]}_scaled.stl`
        );

        if (savePath) {
          fs.writeFileSync(savePath, Buffer.from(response.data));
          showStatus('scale-status', `Model scaled and saved`, 'success');
          loadModelToViewer(savePath);
        }
      } else {
        downloadBlob(response.data, `${currentFile.name.split('.')[0]}_scaled.stl`);
        showStatus('scale-status', 'Scaling complete (Downloaded)', 'success');
      }
    } catch (error) {
      console.error('Scaling error:', error);
      showStatus('scale-status', `Error: ${error.message}`, 'error');
    } finally {
      scaleBtn.disabled = false;
    }
  });
}

// Separate functionality
function initializeSeparate() {
  const separateBtn = document.getElementById('separate-btn');

  separateBtn.addEventListener('click', async () => {
    if (!currentFile) {
      showStatus('separate-status', 'Please upload a file first', 'error');
      return;
    }

    try {
      showStatus('separate-status', 'Separating parts...', 'info');
      separateBtn.disabled = true;

      const fd = new (FormData || window.FormData)();
      fd.append('file', currentFile);

      const response = await axios.post(`${API_BASE}/separate`, fd, {
        headers: fd.getHeaders ? fd.getHeaders() : {}
      });

      displayPartsInfo(response.data);
      showStatus('separate-status', `Found ${response.data.total_parts} parts`, 'success');
    } catch (error) {
      console.error('Separation error:', error);
      showStatus('separate-status', `Error: ${error.message}`, 'error');
    } finally {
      separateBtn.disabled = false;
    }
  });
}

function displayPartsInfo(data) {
  const partsList = document.getElementById('parts-list');
  const categorized = data.categorized;

  let html = '';
  for (const [category, parts] of Object.entries(categorized)) {
    if (parts.length > 0) {
      html += `
        <div class="part-category">
          <h4 style="color: var(--accent-primary); margin: 10px 0; font-size: 13px;">${category} (${parts.length})</h4>
          ${parts
            .map(
              (part) => `
            <div class="part-item" style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; padding:6px; background:rgba(255,255,255,0.05); border-radius:4px;">
              <span>${part.name}</span>
              <span style="color: var(--text-muted)">${part.vertices} v</span>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }
  }

  partsList.innerHTML = html;
  partsList.classList.remove('hidden');
}

// Transform functionality
function initializeTransform() {
  const rotateBtn = document.getElementById('rotate-model-btn');
  const translateBtn = document.getElementById('translate-model-btn');
  const scaleBtn = document.getElementById('scale-model-btn');
  const snapToBaseBtn = document.getElementById('snap-to-base-btn');
  const snapEnabled = document.getElementById('snap-enabled');
  
  // Initialize snapping state
  let snappingEnabled = true;
  let snapGridSize = 5;
  let snapAngleStep = 15;
  
  // Snap toggle handler
  if (snapEnabled) {
    snapEnabled.addEventListener('change', (e) => {
      snappingEnabled = e.target.checked;
      const snapOptions = document.getElementById('snap-options');
      if (snapOptions) {
        snapOptions.style.opacity = snappingEnabled ? '1' : '0.5';
      }
      updateStatus(snappingEnabled ? 'Snapping enabled' : 'Snapping disabled', 'info');
    });
  }
  
  // Snap settings handlers
  const snapGridInput = document.getElementById('snap-grid-size');
  const snapAngleInput = document.getElementById('snap-angle-step');
  
  if (snapGridInput) {
    snapGridInput.addEventListener('change', (e) => {
      snapGridSize = parseFloat(e.target.value);
    });
  }
  
  if (snapAngleInput) {
    snapAngleInput.addEventListener('change', (e) => {
      snapAngleStep = parseFloat(e.target.value);
    });
  }
  
  // Snap to base functionality
  if (snapToBaseBtn) {
    snapToBaseBtn.addEventListener('click', () => {
      if (currentModel && scene) {
        // Calculate model bounds
        const box = new THREE.Box3().setFromObject(currentModel);
        const minY = box.min.y;
        
        // Move model so its bottom is at y=0 (plate base)
        currentModel.position.y -= minY;
        
        updateStatus('Model snapped to plate base', 'success');
      } else {
        showStatus('transform-status', 'No model loaded', 'error');
      }
    });
  }
  
  // Apply snapping to a value
  function applySnapping(value, snapSize) {
    if (!snappingEnabled) return value;
    return Math.round(value / snapSize) * snapSize;
  }
  
  // Update transform controls with snapping
  if (transformControls) {
    transformControls.addEventListener('objectChange', () => {
      if (!currentModel || !snappingEnabled) return;
      
      const snapMode = document.getElementById('snap-mode')?.value || 'both';
      
      if (snapMode === 'grid' || snapMode === 'both') {
        // Apply position snapping
        currentModel.position.x = applySnapping(currentModel.position.x, snapGridSize);
        currentModel.position.y = applySnapping(currentModel.position.y, snapGridSize);
        currentModel.position.z = applySnapping(currentModel.position.z, snapGridSize);
      }
      
      if (snapMode === 'angle' || snapMode === 'both') {
        // Apply rotation snapping (convert to degrees, snap, convert back to radians)
        const snapAngleRad = (snapAngleStep * Math.PI) / 180;
        currentModel.rotation.x = applySnapping(currentModel.rotation.x, snapAngleRad);
        currentModel.rotation.y = applySnapping(currentModel.rotation.y, snapAngleRad);
        currentModel.rotation.z = applySnapping(currentModel.rotation.z, snapAngleRad);
      }
    });
  }

  rotateBtn.addEventListener('click', async () => {
    if (!currentFile) {
      showStatus('transform-status', 'Please upload a file first', 'error');
      return;
    }

    const axisEl = document.getElementById('rotate-axis');
    const angleEl = document.getElementById('rotate-angle');
    
    if (!axisEl || !angleEl) {
      showStatus('transform-status', 'Transform controls not available', 'error');
      return;
    }
    
    const axis = axisEl.value;
    let angle = parseFloat(angleEl.value);
    
    // Validate angle input
    if (isNaN(angle)) {
      showStatus('transform-status', 'Please enter a valid angle', 'error');
      return;
    }
    
    // Apply angle snapping if enabled
    if (snappingEnabled) {
      angle = applySnapping(angle, snapAngleStep);
    }

    try {
      showStatus('transform-status', 'Rotating model...', 'info');
      rotateBtn.disabled = true;

      const fd = new (FormData || window.FormData)();
      fd.append('file', currentFile);
      fd.append('operation', 'rotate');
      fd.append('axis', axis);
      fd.append('angle', angle);

      const response = await axios.post(`${API_BASE}/transform`, fd, {
        headers: fd.getHeaders ? fd.getHeaders() : {},
        responseType: 'arraybuffer'
      });

      if (ipcRenderer) {
        const savePath = await ipcRenderer.invoke(
          'save-file',
          `${currentFile.name.split('.')[0]}_rotated.stl`
        );
        if (savePath) {
          fs.writeFileSync(savePath, Buffer.from(response.data));
          showStatus('transform-status', 'Rotated successfully', 'success');
          loadModelToViewer(savePath);
        }
      } else {
        downloadBlob(response.data, `${currentFile.name.split('.')[0]}_rotated.stl`);
        showStatus('transform-status', 'Rotated (Downloaded)', 'success');
      }
    } catch (error) {
      console.error('Rotation error:', error);
      showStatus('transform-status', `Error: ${error.message}`, 'error');
    } finally {
      rotateBtn.disabled = false;
    }
  });

  translateBtn.addEventListener('click', async () => {
    if (!currentFile) {
      showStatus('transform-status', 'Please upload a file first', 'error');
      return;
    }

    let x = parseFloat(document.getElementById('translate-x').value);
    let y = parseFloat(document.getElementById('translate-y').value);
    let z = parseFloat(document.getElementById('translate-z').value);
    
    // Validate inputs
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      showStatus('transform-status', 'Please enter valid translation values', 'error');
      return;
    }
    
    // Apply grid snapping if enabled
    if (snappingEnabled) {
      x = applySnapping(x, snapGridSize);
      y = applySnapping(y, snapGridSize);
      z = applySnapping(z, snapGridSize);
    }

    try {
      showStatus('transform-status', 'Translating model...', 'info');
      translateBtn.disabled = true;

      const fd = new (FormData || window.FormData)();
      fd.append('file', currentFile);
      fd.append('operation', 'translate');
      fd.append('x', x);
      fd.append('y', y);
      fd.append('z', z);

      const response = await axios.post(`${API_BASE}/transform`, fd, {
        headers: fd.getHeaders ? fd.getHeaders() : {},
        responseType: 'arraybuffer'
      });

      if (ipcRenderer) {
        const savePath = await ipcRenderer.invoke(
          'save-file',
          `${currentFile.name.split('.')[0]}_translated.stl`
        );
        if (savePath) {
          fs.writeFileSync(savePath, Buffer.from(response.data));
          showStatus('transform-status', 'Translated successfully', 'success');
          loadModelToViewer(savePath);
        }
      } else {
        downloadBlob(response.data, `${currentFile.name.split('.')[0]}_translated.stl`);
        showStatus('transform-status', 'Translated (Downloaded)', 'success');
      }
    } catch (error) {
      console.error('Translation error:', error);
      showStatus('transform-status', `Error: ${error.message}`, 'error');
    } finally {
      translateBtn.disabled = false;
    }
  });
  
  // Scale functionality
  if (scaleBtn) {
    scaleBtn.addEventListener('click', async () => {
      if (!currentFile) {
        showStatus('transform-status', 'Please upload a file first', 'error');
        return;
      }

      const scaleFactor = parseFloat(document.getElementById('scale-factor').value);

      // Validate scale factor
      if (isNaN(scaleFactor) || scaleFactor <= 0) {
        showStatus('transform-status', 'Please enter a valid positive scale factor', 'error');
        return;
      }

      try {
        showStatus('transform-status', 'Scaling model...', 'info');
        scaleBtn.disabled = true;

        const fd = new (FormData || window.FormData)();
        fd.append('file', currentFile);
        fd.append('operation', 'scale');
        fd.append('factor', scaleFactor);

        const response = await axios.post(`${API_BASE}/transform`, fd, {
          headers: fd.getHeaders ? fd.getHeaders() : {},
          responseType: 'arraybuffer'
        });

        if (ipcRenderer) {
          const savePath = await ipcRenderer.invoke(
            'save-file',
            `${currentFile.name.split('.')[0]}_scaled.stl`
          );
          if (savePath) {
            fs.writeFileSync(savePath, Buffer.from(response.data));
            showStatus('transform-status', 'Scaled successfully', 'success');
            loadModelToViewer(savePath);
          }
        } else {
          downloadBlob(response.data, `${currentFile.name.split('.')[0]}_scaled.stl`);
          showStatus('transform-status', 'Scaled (Downloaded)', 'success');
        }
      } catch (error) {
        console.error('Scale error:', error);
        showStatus('transform-status', `Error: ${error.message}`, 'error');
      } finally {
        scaleBtn.disabled = false;
      }
    });
  }
}

// Supports functionality
function initializeSupports() {
  const generateBtn = document.getElementById('generate-supports-btn');
  const supportMode = document.getElementById('support-mode');

  generateBtn.addEventListener('click', async () => {
    if (!currentFile) {
      showStatus('supports-status', 'Please upload a file first', 'error');
      return;
    }

    const mode = supportMode.value;
    const overhangAngle = document.getElementById('overhang-angle').value;
    const density = document.getElementById('support-density').value;

    try {
      showStatus('supports-status', 'Working...', 'info');
      generateBtn.disabled = true;

      const fd = new (FormData || window.FormData)();
      fd.append('file', currentFile);
      fd.append('mode', mode);
      fd.append('overhang_angle', overhangAngle);
      fd.append('density', density);

      const response = await axios.post(`${API_BASE}/generate-supports`, fd, {
        headers: fd.getHeaders ? fd.getHeaders() : {},
        responseType: mode === 'estimate' ? 'json' : 'arraybuffer'
      });

      if (mode === 'estimate') {
        displaySupportsInfo(response.data);
        showStatus('supports-status', 'Estimation complete', 'success');
      } else {
        if (ipcRenderer) {
          const savePath = await ipcRenderer.invoke(
            'save-file',
            `${currentFile.name.split('.')[0]}_with_supports.stl`
          );
          if (savePath) {
            fs.writeFileSync(savePath, Buffer.from(response.data));
            showStatus('supports-status', 'Supports generated', 'success');
            loadModelToViewer(savePath);
          }
        } else {
          downloadBlob(response.data, `${currentFile.name.split('.')[0]}_with_supports.stl`);
          showStatus('supports-status', 'Generated (Downloaded)', 'success');
        }
      }
    } catch (error) {
      console.error('Supports error:', error);
      showStatus('supports-status', `Error: ${error.message}`, 'error');
    } finally {
      generateBtn.disabled = false;
    }
  });
}

function displaySupportsInfo(data) {
  const supportsInfo = document.getElementById('supports-info');

  const html = `
    <h4 style="color:var(--accent-primary); font-size:14px; margin-bottom:8px;">Support Estimation</h4>
    <ul style="list-style:none; font-size:12px; color:var(--text-secondary);">
      <li>• Count: ${data.num_supports}</li>
      <li>• Avg height: ${data.avg_height.toFixed(2)} mm</li>
      <li>• Material: ${data.estimated_material.toFixed(2)} mm³</li>
    </ul>
  `;

  supportsInfo.innerHTML = html;
  supportsInfo.classList.remove('hidden');
}

// Sprue functionality
function initializeSprue() {
  const generateBtn = document.getElementById('generate-sprue-btn');
  const printerProfile = document.getElementById('printer-profile');
  const customBuildPlate = document.getElementById('custom-build-plate');

  printerProfile.addEventListener('change', () => {
    if (printerProfile.value === 'custom') {
      customBuildPlate.classList.remove('hidden');
    } else {
      customBuildPlate.classList.add('hidden');
    }
  });

  generateBtn.addEventListener('click', async () => {
    if (!currentFile) {
      showStatus('sprue-status', 'Please upload a file first', 'error');
      return;
    }

    let buildPlateX, buildPlateY, buildPlateZ;

    if (printerProfile.value === 'custom') {
      buildPlateX = document.getElementById('plate-x').value;
      buildPlateY = document.getElementById('plate-y').value;
      buildPlateZ = document.getElementById('plate-z').value;
    } else {
      // Fetch printer profiles
      const profiles = await fetchPrinterProfiles(); // This function is now part of initializePrinterProfiles
      const profile = profiles[printerProfile.value];
      buildPlateX = profile.build_volume.x;
      buildPlateY = profile.build_volume.y;
      buildPlateZ = profile.build_volume.z;
    }

    try {
      showStatus('sprue-status', 'Generating sprue...', 'info');
      generateBtn.disabled = true;

      const connectorType = document.getElementById('connector-type').value;

      const fd = new (FormData || window.FormData)();
      fd.append('file', currentFile);
      fd.append('build_plate_x', buildPlateX);
      fd.append('build_plate_y', buildPlateY);
      fd.append('build_plate_z', buildPlateZ);
      fd.append('connector_type', connectorType);

      const response = await axios.post(`${API_BASE}/generate-sprue`, fd, {
        headers: fd.getHeaders ? fd.getHeaders() : {},
        responseType: 'arraybuffer'
      });

      if (ipcRenderer) {
        const savePath = await ipcRenderer.invoke(
          'save-file',
          `${currentFile.name.split('.')[0]}_sprue.stl`
        );
        if (savePath) {
          fs.writeFileSync(savePath, Buffer.from(response.data));
          showStatus('sprue-status', `Sprue generated`, 'success');
          loadModelToViewer(savePath);
        }
      } else {
        downloadBlob(response.data, `${currentFile.name.split('.')[0]}_sprue.stl`);
        showStatus('sprue-status', 'Sprue generated (Downloaded)', 'success');
      }
    } catch (error) {
      console.error('Sprue generation error:', error);
      showStatus('sprue-status', `Error: ${error.message}`, 'error');
    } finally {
      generateBtn.disabled = false;
    }
  });
}

// Photo functionality
function initializePhoto() {
  const selectPhotosBtn = document.getElementById('select-photos-btn');
  const generateModelBtn = document.getElementById('generate-model-btn');
  const photoPreview = document.getElementById('photo-preview');

  // Hidden input for web mode
  const webFileInput = document.createElement('input');
  webFileInput.type = 'file';
  webFileInput.multiple = true;
  webFileInput.accept = 'image/*';
  webFileInput.style.display = 'none';
  document.body.appendChild(webFileInput);

  selectPhotosBtn.addEventListener('click', async () => {
    if (ipcRenderer) {
      const files = await ipcRenderer.invoke('select-multiple-files');
      handlePhotoSelection(files);
    } else {
      webFileInput.click();
    }
  });

  webFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handlePhotoSelection(Array.from(e.target.files));
    }
  });

  function handlePhotoSelection(files) {
    if (files && files.length > 0) {
      currentFiles = files;

      // Show preview
      photoPreview.innerHTML =
        files
          .slice(0, 8)
          .map((file) => {
            const src = typeof file === 'string' ? file : URL.createObjectURL(file);
            return `<img src="${src}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 4px;">`;
          })
          .join('') +
        (files.length > 8 ? `<span style="font-size:10px">+${files.length - 8}</span>` : '');

      generateModelBtn.classList.remove('hidden');
      showStatus('photo-status', `${files.length} images selected`, 'success');
    }
  }

  generateModelBtn.addEventListener('click', async () => {
    if (currentFiles.length < 2) {
      showStatus('photo-status', 'Minimum 2 photos required', 'error');
      return;
    }

    try {
      showStatus('photo-status', 'Processing...', 'info');
      generateModelBtn.disabled = true;

      const fd = new (FormData || window.FormData)();
      currentFiles.forEach((file) => {
        if (typeof file === 'string' && fs) {
          fd.append('files', fs.createReadStream(file));
        } else {
          fd.append('files', file);
        }
      });

      const response = await axios.post(`${API_BASE}/photo-to-model`, fd, {
        headers: fd.getHeaders ? fd.getHeaders() : {},
        responseType: 'arraybuffer'
      });

      if (ipcRenderer) {
        const savePath = await ipcRenderer.invoke('save-file', 'photo_model.stl');
        if (savePath) {
          fs.writeFileSync(savePath, Buffer.from(response.data));
          showStatus('photo-status', `Generated successfully`, 'success');
          loadModelToViewer(savePath);
        }
      } else {
        downloadBlob(response.data, 'photo_model.stl');
        showStatus('photo-status', 'Generated (Downloaded)', 'success');
      }
    } catch (error) {
      console.error('Photo to model error:', error);
      showStatus('photo-status', `Error: ${error.message}`, 'error');
    } finally {
      generateModelBtn.disabled = false;
    }
  });
}

// ==================== Marketplace ====================

async function initializeMarketplace() {
  const marketplaceGrid = document.getElementById('marketplace-grid');

  try {
    const res = await axios.get(`${API_BASE}/marketplace/items`);
    renderMarketplace(res.data);
  } catch (e) {
    console.error('Marketplace fetch failed');
  }
}

function renderMarketplace(items) {
  const grid = document.getElementById('marketplace-grid');
  if (items.length === 0) {
    grid.innerHTML = '<p class="status-message info">No items in marketplace yet.</p>';
    return;
  }

  grid.innerHTML = items
    .map(
      (item) => `
    <div class="marketplace-item">
      <div class="market-thumb" style="display:flex; align-items:center; justify-content:center; color:var(--text-muted)">3D PREVIEW</div>
      <div class="market-info">
        <h4>${item.title}</h4>
        <span class="market-price">$${item.price.toFixed(2)}</span>
      </div>
      <button class="btn btn-outline btn-sm" style="width:100%; border-radius:0;" onclick="purchaseItem('${item.id}')">Get Part</button>
    </div>
  `
    )
    .join('');
}

async function purchaseItem(itemId) {
  alert('Redirecting to Stripe Checkout for secure payment...');
  // In real app, call /api/marketplace/purchase to get checkout URL
}

// ==================== Custom Printer Profiles ====================

async function initializePrinterProfiles() {
  const profileSelect = document.getElementById('printer-profile');
  const addBtn = document.getElementById('add-custom-printer-btn');
  const customPanel = document.getElementById('custom-build-plate');
  const saveBtn = document.getElementById('save-custom-printer');

  addBtn.addEventListener('click', () => {
    customPanel.classList.toggle('hidden');
  });

  saveBtn.addEventListener('click', async () => {
    const nameInput = document.getElementById('custom-printer-name');
    const customName = nameInput ? nameInput.value.trim() : '';

    const data = {
      name: customName || `Custom Printer ${new Date().toLocaleDateString()}`,
      x: parseFloat(document.getElementById('plate-x').value),
      y: parseFloat(document.getElementById('plate-y').value),
      z: parseFloat(document.getElementById('plate-z').value)
    };

    if (!data.x || !data.y || !data.z) {
      updateStatus('Please enter valid dimensions', 'error');
      return;
    }

    try {
      await axios.post(`${API_BASE}/printer-profiles`, data);
      await loadPrinterProfiles();
      customPanel.classList.add('hidden');
      // Clear form
      if (nameInput) nameInput.value = '';
      document.getElementById('plate-x').value = '';
      document.getElementById('plate-y').value = '';
      document.getElementById('plate-z').value = '245';
      updateStatus('Custom printer profile saved!', 'success');
    } catch (e) {
      updateStatus('Pro subscription required to save custom printers', 'error');
    }
  });

  profileSelect.addEventListener('change', async () => {
    const profiles = await fetchPrinterProfiles();
    const profile = profiles[profileSelect.value];
    if (profile) {
      createPrinterPlate(profile.build_volume.x, profile.build_volume.y, profile.build_volume.z);
      updateStatus(`Workspace updated to ${profile.name}`, 'info');
    }
  });

  await loadPrinterProfiles();
}

async function fetchPrinterProfiles() {
  try {
    const res = await axios.get(`${API_BASE}/printer-profiles`);
    return res.data;
  } catch (error) {
    console.warn('Using standard printer profiles - backend unavailable');
    // Comprehensive industry resin printer database (fallback)
    return {
      // Elegoo Mars Series
      elegoo_mars_3: { name: 'Elegoo Mars 3', build_volume: { x: 143.43, y: 89.6, z: 175 } },
      elegoo_mars_3_pro: {
        name: 'Elegoo Mars 3 Pro',
        build_volume: { x: 143.43, y: 89.6, z: 175 }
      },
      elegoo_mars_4_ultra: {
        name: 'Elegoo Mars 4 Ultra',
        build_volume: { x: 153.36, y: 77.76, z: 165 }
      },
      elegoo_mars_4_max: {
        name: 'Elegoo Mars 4 Max',
        build_volume: { x: 196.608, y: 122.88, z: 150 }
      },

      // Elegoo Saturn Series
      elegoo_saturn: { name: 'Elegoo Saturn', build_volume: { x: 192, y: 120, z: 200 } },
      elegoo_saturn_2: { name: 'Elegoo Saturn 2', build_volume: { x: 218.88, y: 122.88, z: 250 } },
      elegoo_saturn_3: { name: 'Elegoo Saturn 3', build_volume: { x: 218.88, y: 122.88, z: 250 } },
      elegoo_saturn_3_ultra: {
        name: 'Elegoo Saturn 3 Ultra',
        build_volume: { x: 218.88, y: 122.88, z: 250 }
      },
      elegoo_saturn_4_ultra: {
        name: 'Elegoo Saturn 4 Ultra',
        build_volume: { x: 218.88, y: 122.88, z: 220 }
      },

      // Elegoo Jupiter Series
      elegoo_jupiter: { name: 'Elegoo Jupiter', build_volume: { x: 277.848, y: 156.096, z: 300 } },
      elegoo_jupiter_2: {
        name: 'Elegoo Jupiter 2',
        build_volume: { x: 277.848, y: 156.096, z: 320 }
      },

      // Anycubic Photon Series
      anycubic_photon_mono_4k: {
        name: 'Anycubic Photon Mono 4K',
        build_volume: { x: 132, y: 80, z: 165 }
      },
      anycubic_photon_m3: {
        name: 'Anycubic Photon M3',
        build_volume: { x: 163.84, y: 102.4, z: 180 }
      },
      anycubic_photon_m3_plus: {
        name: 'Anycubic Photon M3 Plus',
        build_volume: { x: 245.76, y: 197.12, z: 122 }
      },
      anycubic_photon_m3_premium: {
        name: 'Anycubic Photon M3 Premium',
        build_volume: { x: 298.08, y: 164.16, z: 300 }
      },
      anycubic_photon_mono_x: {
        name: 'Anycubic Photon Mono X',
        build_volume: { x: 192, y: 120, z: 245 }
      },
      anycubic_photon_mono_x_6k: {
        name: 'Anycubic Photon Mono X 6K',
        build_volume: { x: 197.12, y: 122.88, z: 245 }
      },
      anycubic_photon_mono_x2: {
        name: 'Anycubic Photon Mono X2',
        build_volume: { x: 198, y: 124, z: 245 }
      },
      anycubic_photon_d2: {
        name: 'Anycubic Photon D2',
        build_volume: { x: 131.84, y: 73.73, z: 165 }
      },

      // Phrozen Sonic Series
      phrozen_sonic_mini_8k: {
        name: 'Phrozen Sonic Mini 8K',
        build_volume: { x: 165, y: 72, z: 180 }
      },
      phrozen_sonic_mini_8k_s: {
        name: 'Phrozen Sonic Mini 8K S',
        build_volume: { x: 165, y: 71.28, z: 180 }
      },
      phrozen_sonic_mighty_4k: {
        name: 'Phrozen Sonic Mighty 4K',
        build_volume: { x: 200, y: 125, z: 220 }
      },
      phrozen_sonic_mighty_8k: {
        name: 'Phrozen Sonic Mighty 8K',
        build_volume: { x: 218, y: 123, z: 235 }
      },
      phrozen_sonic_mega_8k: {
        name: 'Phrozen Sonic Mega 8K',
        build_volume: { x: 330, y: 185, z: 400 }
      },
      phrozen_sonic_mega_8k_s: {
        name: 'Phrozen Sonic Mega 8K S',
        build_volume: { x: 330, y: 185.76, z: 400 }
      },

      // Creality Halot Series
      creality_halot_one: { name: 'Creality Halot One', build_volume: { x: 127, y: 80, z: 160 } },
      creality_halot_one_pro: {
        name: 'Creality Halot One Pro',
        build_volume: { x: 127.31, y: 80.82, z: 160 }
      },
      creality_halot_lite: { name: 'Creality Halot Lite', build_volume: { x: 127, y: 80, z: 160 } },
      creality_halot_sky: { name: 'Creality Halot Sky', build_volume: { x: 192, y: 120, z: 200 } },
      creality_halot_mage: {
        name: 'Creality Halot Mage',
        build_volume: { x: 228, y: 128, z: 230 }
      },
      creality_halot_mage_pro: {
        name: 'Creality Halot Mage Pro',
        build_volume: { x: 228.096, y: 128.304, z: 230 }
      },
      creality_halot_max: { name: 'Creality Halot Max', build_volume: { x: 298, y: 164, z: 340 } },

      // Formlabs Form Series
      formlabs_form_3: { name: 'Formlabs Form 3', build_volume: { x: 145, y: 145, z: 185 } },
      formlabs_form_3_plus: { name: 'Formlabs Form 3+', build_volume: { x: 145, y: 145, z: 185 } },
      formlabs_form_3l: { name: 'Formlabs Form 3L', build_volume: { x: 200, y: 335, z: 300 } },
      formlabs_form_3b: { name: 'Formlabs Form 3B', build_volume: { x: 145, y: 145, z: 185 } },
      formlabs_form_4: { name: 'Formlabs Form 4', build_volume: { x: 200, y: 125, z: 210 } },

      // Prusa Research
      prusa_sl1s: { name: 'Prusa SL1S', build_volume: { x: 127, y: 80, z: 150 } },

      // Longer Orange Series
      longer_orange_30: { name: 'Longer Orange 30', build_volume: { x: 120, y: 68, z: 170 } },
      longer_orange_4k: { name: 'Longer Orange 4K', build_volume: { x: 192, y: 120, z: 245 } },

      // Qidi Tech
      qidi_shadow_6_pro: {
        name: 'Qidi Shadow 6 Pro',
        build_volume: { x: 131.56, y: 73.6, z: 160 }
      },

      // Peopoly
      peopoly_phenom: { name: 'Peopoly Phenom', build_volume: { x: 276, y: 155, z: 400 } },
      peopoly_phenom_l: { name: 'Peopoly Phenom L', build_volume: { x: 345, y: 194, z: 400 } },
      peopoly_phenom_noir: {
        name: 'Peopoly Phenom Noir',
        build_volume: { x: 276, y: 155, z: 400 }
      },

      // Voxelab
      voxelab_proxima_8_1: {
        name: 'Voxelab Proxima 8.1',
        build_volume: { x: 192, y: 120, z: 245 }
      },

      // Uniformation
      uniformation_gk_two: { name: 'Uniformation GKtwo', build_volume: { x: 192, y: 120, z: 200 } },

      // Custom option
      custom: { name: 'Custom Printer', build_volume: { x: 192, y: 120, z: 245 } }
    };
  }
}

async function loadPrinterProfiles() {
  const profileSelect = document.getElementById('printer-profile');
  if (!profileSelect) {
    console.error('Printer profile select element not found');
    return;
  }

  try {
    const profiles = await fetchPrinterProfiles();
    profileSelect.innerHTML = Object.entries(profiles)
      .map(
        ([id, p]) => `
      <option value="${id}">${p.name} (${p.build_volume.x}×${p.build_volume.y}×${p.build_volume.z}mm)</option>
    `
      )
      .join('');

    // Auto-select Saturn 2 if available, otherwise first option
    if (profiles['elegoo_saturn_2']) {
      profileSelect.value = 'elegoo_saturn_2';
    }

    // Trigger initial workspace update
    const firstProfile = profiles[profileSelect.value];
    if (firstProfile) {
      createPrinterPlate(
        firstProfile.build_volume.x,
        firstProfile.build_volume.y,
        firstProfile.build_volume.z
      );
      updateStatus(`Workspace set to ${firstProfile.name}`, 'info');
    }
  } catch (e) {
    console.error('Error loading printer profiles:', e);
    profileSelect.innerHTML = '<option value="error">Failed to load profiles</option>';
  }
}

// Utility functions
function showStatus(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `status-message ${type}`;
}

function updateStatus(message, type = 'info') {
  const statusText = document.getElementById('status-text');
  statusText.textContent = message;
  statusText.style.color =
    type === 'success'
      ? 'var(--success)'
      : type === 'error'
        ? 'var(--error)'
        : 'var(--text-primary)';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function checkBackendStatus() {
  try {
    const res = await axios.get(`${API_BASE}/health`, { timeout: 2000 });
    document.getElementById('api-status').innerHTML =
      'API Connected <span class="status-dot"></span>';
  } catch (error) {
    document.getElementById('api-status').innerHTML =
      'API Error <span class="status-dot" style="background: var(--error); box-shadow: 0 0 8px var(--error)"></span>';
  }
}

// Helper for web mode downloads
function downloadBlob(data, fileName) {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

// ============================================
// Pro Subscription Features
// ============================================

let proApiKey = localStorage.getItem('sprucecrafter_pro_key') || null;
let isProUser = false;

// Check Pro status on startup
async function checkProStatus() {
  if (!proApiKey) {
    updateProUI(false);
    return;
  }

  try {
    const response = await axios.get(`${API_BASE}/pro/status`, {
      headers: { 'X-API-Key': proApiKey }
    });

    if (response.data.is_pro) {
      isProUser = true;
      updateProUI(true, response.data);
    } else {
      // Invalid key
      proApiKey = null;
      localStorage.removeItem('sprucecrafter_pro_key');
      updateProUI(false);
    }
  } catch (error) {
    console.error('Pro status check failed:', error);
    updateProUI(false);
  }
}

function updateProUI(isPro, userData = null) {
  const proBtn = document.getElementById('pro-btn');
  const proStatus = document.getElementById('pro-status');

  if (isPro && userData) {
    proBtn.classList.add('pro-active');
    proBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Pro Active</span>
    `;
    proStatus.classList.add('active');
    proStatus.querySelector('span').textContent = `Pro: ${userData.name || userData.email}`;
  } else {
    proBtn.classList.remove('pro-active');
    proBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
      <span>Go Pro</span>
    `;
    proStatus.classList.remove('active');
  }
}

// Pro subscription button handler
// NOTE: Using browser prompts for simplicity in initial implementation.
// TODO: Replace with proper modal dialogs for better UX in future versions.
document.getElementById('pro-btn').addEventListener('click', async () => {
  if (isProUser) {
    // Show Pro info
    showNotification('You are a Pro subscriber! Thank you for your support.', 'success');
    return;
  }

  // Prompt for email
  const email = prompt('Enter your email to subscribe to SprueCrafter Pro ($10/month):');
  if (!email || !email.includes('@')) {
    if (email !== null) {
      showNotification('Please enter a valid email address', 'error');
    }
    return;
  }

  const name = prompt('Enter your name (optional):') || email;

  try {
    showNotification('Creating checkout session...', 'info');

    const response = await axios.post(`${API_BASE}/pro/subscribe`, {
      email: email,
      name: name
    });

    if (response.data.checkout_url) {
      // Open checkout URL in browser
      if (typeof require !== 'undefined') {
        require('electron').shell.openExternal(response.data.checkout_url);
      } else {
        window.open(response.data.checkout_url, '_blank');
      }

      showNotification(
        'Checkout opened in your browser. Complete payment and enter your API key here.',
        'info'
      );

      // Prompt for API key after checkout
      setTimeout(() => {
        const apiKey = prompt(
          'After completing payment, enter your API key from the confirmation email:'
        );
        if (apiKey && apiKey.length > 10) {
          localStorage.setItem('sprucecrafter_pro_key', apiKey);
          proApiKey = apiKey;
          checkProStatus();
        }
      }, 3000);
    }
  } catch (error) {
    console.error('Pro subscription error:', error);
    showNotification('Failed to create checkout session. Please try again.', 'error');
  }
});

// Check Pro status on load
checkProStatus();

// ==================== Print Notes System ====================

function initializeNotes() {
  const saveNoteBtn = document.getElementById('save-note-btn');
  const boundsWarningClose = document.getElementById('bounds-warning-close');
  
  // Load notes from localStorage
  loadPrintNotes();
  
  // Auto-populate printer from selected printer profile
  const printerSelect = document.getElementById('printer-profile');
  if (printerSelect) {
    printerSelect.addEventListener('change', () => {
      const printerInput = document.getElementById('note-printer');
      if (printerInput) {
        const selectedText = printerSelect.options[printerSelect.selectedIndex].text;
        printerInput.value = selectedText.split(' (')[0]; // Remove dimensions
      }
    });
  }
  
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
      const note = {
        id: Date.now(),
        date: new Date().toISOString(),
        modelName: document.getElementById('note-model-name').value,
        modelType: document.getElementById('note-model-type').value,
        modelScale: document.getElementById('note-model-scale').value,
        printer: document.getElementById('note-printer').value,
        resin: document.getElementById('note-resin').value,
        printTime: document.getElementById('note-print-time').value,
        temperature: document.getElementById('note-temp-value').value,
        temperatureUnit: document.getElementById('note-temp-unit').value,
        additionalNotes: document.getElementById('note-additional').value
      };
      
      // Validate required fields
      if (!note.modelName) {
        showStatus('note-status', 'Please enter a model name', 'error');
        return;
      }
      
      // Save to localStorage
      const notes = JSON.parse(localStorage.getItem('sprucecrafter_notes') || '[]');
      notes.unshift(note); // Add to beginning
      localStorage.setItem('sprucecrafter_notes', JSON.stringify(notes));
      
      // Clear form
      document.getElementById('note-model-name').value = '';
      document.getElementById('note-model-type').value = '';
      document.getElementById('note-model-scale').value = '';
      document.getElementById('note-resin').value = '';
      document.getElementById('note-print-time').value = '';
      document.getElementById('note-temp-value').value = '';
      document.getElementById('note-additional').value = '';
      
      // Reload display
      loadPrintNotes();
      
      showStatus('note-status', 'Print note saved successfully!', 'success');
    });
  }
}

function loadPrintNotes() {
  const notesHistory = document.getElementById('notes-history');
  if (!notesHistory) return;
  
  const notes = JSON.parse(localStorage.getItem('sprucecrafter_notes') || '[]');
  
  if (notes.length === 0) {
    notesHistory.innerHTML = '<p style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px;">No print notes yet. Add your first note above!</p>';
    return;
  }
  
  notesHistory.innerHTML = notes.map(note => `
    <div class="note-item">
      <div class="note-item-header">
        <div class="note-item-title">${escapeHtml(note.modelName || 'Untitled')}</div>
        <div class="note-item-date">${new Date(note.date).toLocaleDateString()}</div>
      </div>
      <div class="note-item-details">
        ${note.modelType ? `<div class="note-item-detail"><span class="note-item-detail-label">Type</span><span class="note-item-detail-value">${escapeHtml(note.modelType)}</span></div>` : ''}
        ${note.modelScale ? `<div class="note-item-detail"><span class="note-item-detail-label">Scale</span><span class="note-item-detail-value">${escapeHtml(note.modelScale)}</span></div>` : ''}
        ${note.printer ? `<div class="note-item-detail"><span class="note-item-detail-label">Printer</span><span class="note-item-detail-value">${escapeHtml(note.printer)}</span></div>` : ''}
        ${note.resin ? `<div class="note-item-detail"><span class="note-item-detail-label">Resin</span><span class="note-item-detail-value">${escapeHtml(note.resin)}</span></div>` : ''}
        ${note.printTime ? `<div class="note-item-detail"><span class="note-item-detail-label">Print Time</span><span class="note-item-detail-value">${escapeHtml(note.printTime)}</span></div>` : ''}
        ${note.temperature ? `<div class="note-item-detail"><span class="note-item-detail-label">Temperature</span><span class="note-item-detail-value">${escapeHtml(note.temperature)}°${escapeHtml(note.temperatureUnit)}</span></div>` : ''}
      </div>
      ${note.additionalNotes ? `<p style="font-size: 11px; color: var(--text-secondary); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color);">${escapeHtml(note.additionalNotes)}</p>` : ''}
      <div class="note-item-actions">
        <button data-note-id="${escapeHtml(String(note.id))}">Delete</button>
      </div>
    </div>
  `).join('');
  
  // Add event listeners to delete buttons
  notesHistory.querySelectorAll('.note-item-actions button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const noteId = parseInt(e.target.getAttribute('data-note-id'));
      deleteNote(noteId);
    });
  });
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function deleteNote(noteId) {
  const notes = JSON.parse(localStorage.getItem('sprucecrafter_notes') || '[]');
  const filtered = notes.filter(n => n.id !== noteId);
  localStorage.setItem('sprucecrafter_notes', JSON.stringify(filtered));
  loadPrintNotes();
  updateStatus('Note deleted', 'info');
}

// Make deleteNote available globally
window.deleteNote = deleteNote;

// ==================== Bounds Checking ====================

let currentBuildPlate = { x: 192, y: 120, z: 245 }; // Default Saturn size

function initializeBoundsWarning() {
  const boundsWarningClose = document.getElementById('bounds-warning-close');
  if (boundsWarningClose) {
    boundsWarningClose.addEventListener('click', () => {
      document.getElementById('bounds-warning-dialog').classList.add('hidden');
    });
  }
}

function checkModelBounds(model) {
  if (!model || !currentBuildPlate) return;
  
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  
  // Build plate: x = width, y = depth, z = height
  // Model: x = width, y = height (vertical), z = depth
  const exceedsX = size.x > currentBuildPlate.x; // Width
  const exceedsY = size.y > currentBuildPlate.z; // Height (model Y vs plate Z)
  const exceedsZ = size.z > currentBuildPlate.y; // Depth (model Z vs plate Y)
  
  if (exceedsX || exceedsY || exceedsZ) {
    showBoundsWarning(size, currentBuildPlate);
  }
}

function showBoundsWarning(modelSize, plateSize) {
  const dialog = document.getElementById('bounds-warning-dialog');
  const details = document.getElementById('bounds-details');
  
  if (!dialog || !details) return;
  
  details.innerHTML = `
    <strong>Model Dimensions:</strong><br>
    Width (X): ${modelSize.x.toFixed(2)} mm ${modelSize.x > plateSize.x ? '⚠️ EXCEEDS' : '✓'}<br>
    Height (Y): ${modelSize.y.toFixed(2)} mm ${modelSize.y > plateSize.z ? '⚠️ EXCEEDS' : '✓'}<br>
    Depth (Z): ${modelSize.z.toFixed(2)} mm ${modelSize.z > plateSize.y ? '⚠️ EXCEEDS' : '✓'}<br>
    <br>
    <strong>Build Plate Limits:</strong><br>
    Width × Depth × Height: ${plateSize.x} × ${plateSize.y} × ${plateSize.z} mm
  `;
  
  dialog.classList.remove('hidden');
}

// Update build plate reference when printer changes
function updateBuildPlateReference(x, y, z) {
  currentBuildPlate = { x, y, z };
}

// ==================== Enhanced Camera Controls ====================

function lockCameraToObject(object) {
  if (!controls || !camera) return;
  
  if (object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / Math.tan(fov / 2)) * 1.5;
    
    controls.target.copy(center);
    
    const angle = Math.PI / 4;
    const cameraX = center.x + cameraDistance * Math.cos(angle);
    const cameraY = center.y + cameraDistance * 0.7;
    const cameraZ = center.z + cameraDistance * Math.sin(angle);
    
    animateCameraToPosition(new THREE.Vector3(cameraX, cameraY, cameraZ), center);
  } else if (printerPlate) {
    // Lock to build plate when no object selected
    lockCameraToBuildPlate(currentBuildPlate.x, currentBuildPlate.y, currentBuildPlate.z);
  }
}
