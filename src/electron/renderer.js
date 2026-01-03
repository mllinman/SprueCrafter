/**
 * SprueCrafter Renderer
 * Handles UI interactions, API communication, and 3D Visualization
 */

const { ipcRenderer } = require('electron');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls');
const { STLLoader } = require('three/examples/jsm/loaders/STLLoader');
const { OBJLoader } = require('three/examples/jsm/loaders/OBJLoader');

const API_BASE = 'http://127.0.0.1:5000/api';

let currentFile = null;
let currentFiles = [];

// 3D Viewer state
let scene, camera, renderer, controls, printerPlate, currentModel;
const CANVAS_ID = 'viewer-canvas';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  initializeUpload();
  initializeConvert();
  initializeScale();
  initializeSeparate();
  initializeTransform();
  initializeSupports();
  initializeSprue();
  initializePhoto();
  checkBackendStatus();
  
  // Initialize 3D Viewer
  init3DViewer();
  
  // Check backend status periodically
  setInterval(checkBackendStatus, 10000);
});

// Navigation
function initializeNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      
      // Update active states
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      tabContents.forEach(tab => {
        tab.classList.remove('active');
        if (tab.id === `${tabId}-tab`) {
          tab.classList.add('active');
        }
      });
    });
  });
}

// 3D Viewer Implementation
function init3DViewer() {
  const canvas = document.getElementById(CANVAS_ID);
  const container = canvas.parentElement;
  
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  
  // Camera setup
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
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
  
  animate();
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

async function loadModelToViewer(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  updateStatus(`Loading ${path.basename(filePath)}...`, 'info');
  
  if (currentModel) scene.remove(currentModel);
  
  try {
    const loader = ext === '.obj' ? new OBJLoader() : new STLLoader();
    
    // Read file as buffer then to ArrayBuffer
    const buffer = fs.readFileSync(filePath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    
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
      group.traverse(child => {
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
    
    // Adjust camera to fit
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.set(maxDim * 2, maxDim * 2, maxDim * 2);
    controls.target.set(0, size.y / 2, 0);
    
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
  
  // Load into 3D viewer
  loadModelToViewer(file.path);
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
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(currentFile.path));
      formData.append('format', targetFormat);
      
      const response = await axios.post(`${API_BASE}/convert`, formData, {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer'
      });
      
      // Save converted file
      const savePath = await ipcRenderer.invoke('save-file', 
        `${currentFile.name.split('.')[0]}_converted.${targetFormat}`);
      
      if (savePath) {
        fs.writeFileSync(savePath, Buffer.from(response.data));
        showStatus('convert-status', `File converted and saved`, 'success');
        
        // Update viewer if it's a format we support
        if (['stl', 'obj'].includes(targetFormat)) {
          loadModelToViewer(savePath);
        }
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
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(currentFile.path));
      formData.append('scale', scale);
      formData.append('unit', unit);
      
      const response = await axios.post(`${API_BASE}/scale`, formData, {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer'
      });
      
      const savePath = await ipcRenderer.invoke('save-file', 
        `${currentFile.name.split('.')[0]}_scaled.stl`);
      
      if (savePath) {
        fs.writeFileSync(savePath, Buffer.from(response.data));
        showStatus('scale-status', `Model scaled and saved`, 'success');
        loadModelToViewer(savePath);
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
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(currentFile.path));
      
      const response = await axios.post(`${API_BASE}/separate`, formData, {
        headers: formData.getHeaders()
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
          ${parts.map(part => `
            <div class="part-item" style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; padding:6px; background:rgba(255,255,255,0.05); border-radius:4px;">
              <span>${part.name}</span>
              <span style="color: var(--text-muted)">${part.vertices} v</span>
            </div>
          `).join('')}
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
  
  rotateBtn.addEventListener('click', async () => {
    if (!currentFile) {
      showStatus('transform-status', 'Please upload a file first', 'error');
      return;
    }
    
    const axis = document.getElementById('rotate-axis').value;
    const angle = document.getElementById('rotate-angle').value;
    
    try {
      showStatus('transform-status', 'Rotating model...', 'info');
      rotateBtn.disabled = true;
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(currentFile.path));
      formData.append('operation', 'rotate');
      formData.append('axis', axis);
      formData.append('angle', angle);
      
      const response = await axios.post(`${API_BASE}/transform`, formData, {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer'
      });
      
      const savePath = await ipcRenderer.invoke('save-file', 
        `${currentFile.name.split('.')[0]}_rotated.stl`);
      
      if (savePath) {
        fs.writeFileSync(savePath, Buffer.from(response.data));
        showStatus('transform-status', 'Rotated successfully', 'success');
        loadModelToViewer(savePath);
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
    
    const x = document.getElementById('translate-x').value;
    const y = document.getElementById('translate-y').value;
    const z = document.getElementById('translate-z').value;
    
    try {
      showStatus('transform-status', 'Translating model...', 'info');
      translateBtn.disabled = true;
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(currentFile.path));
      formData.append('operation', 'translate');
      formData.append('x', x);
      formData.append('y', y);
      formData.append('z', z);
      
      const response = await axios.post(`${API_BASE}/transform`, formData, {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer'
      });
      
      const savePath = await ipcRenderer.invoke('save-file', 
        `${currentFile.name.split('.')[0]}_translated.stl`);
      
      if (savePath) {
        fs.writeFileSync(savePath, Buffer.from(response.data));
        showStatus('transform-status', 'Translated successfully', 'success');
        loadModelToViewer(savePath);
      }
    } catch (error) {
      console.error('Translation error:', error);
      showStatus('transform-status', `Error: ${error.message}`, 'error');
    } finally {
      translateBtn.disabled = false;
    }
  });
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
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(currentFile.path));
      formData.append('mode', mode);
      formData.append('overhang_angle', overhangAngle);
      formData.append('density', density);
      
      const response = await axios.post(`${API_BASE}/generate-supports`, formData, {
        headers: formData.getHeaders(),
        responseType: mode === 'estimate' ? 'json' : 'arraybuffer'
      });
      
      if (mode === 'estimate') {
        displaySupportsInfo(response.data);
        showStatus('supports-status', 'Estimation complete', 'success');
      } else {
        const savePath = await ipcRenderer.invoke('save-file', 
          `${currentFile.name.split('.')[0]}_with_supports.stl`);
        
        if (savePath) {
          fs.writeFileSync(savePath, Buffer.from(response.data));
          showStatus('supports-status', 'Supports generated', 'success');
          loadModelToViewer(savePath);
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
      const profiles = await fetchPrinterProfiles();
      const profile = profiles[printerProfile.value];
      buildPlateX = profile.build_volume.x;
      buildPlateY = profile.build_volume.y;
      buildPlateZ = profile.build_volume.z;
    }
    
    try {
      showStatus('sprue-status', 'Generating sprue...', 'info');
      generateBtn.disabled = true;
      
      const connectorType = document.getElementById('connector-type').value;
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(currentFile.path));
      formData.append('build_plate_x', buildPlateX);
      formData.append('build_plate_y', buildPlateY);
      formData.append('build_plate_z', buildPlateZ);
      formData.append('connector_type', connectorType);
      
      const response = await axios.post(`${API_BASE}/generate-sprue`, formData, {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer'
      });
      
      const savePath = await ipcRenderer.invoke('save-file', 
        `${currentFile.name.split('.')[0]}_sprue.stl`);
      
      if (savePath) {
        fs.writeFileSync(savePath, Buffer.from(response.data));
        showStatus('sprue-status', `Sprue generated`, 'success');
        loadModelToViewer(savePath);
      }
    } catch (error) {
      console.error('Sprue generation error:', error);
      showStatus('sprue-status', `Error: ${error.message}`, 'error');
    } finally {
      generateBtn.disabled = false;
    }
  });
}

async function fetchPrinterProfiles() {
  try {
    const response = await axios.get(`${API_BASE}/printer-profiles`);
    return response.data;
  } catch (error) {
    console.error('Error fetching printer profiles:', error);
    return {};
  }
}

// Photo functionality
function initializePhoto() {
  const selectPhotosBtn = document.getElementById('select-photos-btn');
  const generateModelBtn = document.getElementById('generate-model-btn');
  const photoPreview = document.getElementById('photo-preview');
  
  selectPhotosBtn.addEventListener('click', async () => {
    const files = await ipcRenderer.invoke('select-multiple-files');
    if (files && files.length > 0) {
      currentFiles = files;
      
      // Show preview
      photoPreview.innerHTML = files.slice(0, 8).map(file => `
        <img src="${file}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 4px;">
      `).join('') + (files.length > 8 ? `<span style="font-size:10px">+${files.length-8}</span>` : '');
      
      generateModelBtn.classList.remove('hidden');
      showStatus('photo-status', `${files.length} images selected`, 'success');
    }
  });
  
  generateModelBtn.addEventListener('click', async () => {
    if (currentFiles.length < 2) {
      showStatus('photo-status', 'Minimum 2 photos required', 'error');
      return;
    }
    
    try {
      showStatus('photo-status', 'Processing...', 'info');
      generateModelBtn.disabled = true;
      
      const formData = new FormData();
      currentFiles.forEach(file => {
        formData.append('files', fs.createReadStream(file));
      });
      
      const response = await axios.post(`${API_BASE}/photo-to-model`, formData, {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer'
      });
      
      const savePath = await ipcRenderer.invoke('save-file', 'photo_model.stl');
      
      if (savePath) {
        fs.writeFileSync(savePath, Buffer.from(response.data));
        showStatus('photo-status', `Generated successfully`, 'success');
        loadModelToViewer(savePath);
      }
    } catch (error) {
      console.error('Photo to model error:', error);
      showStatus('photo-status', `Error: ${error.message}`, 'error');
    } finally {
      generateModelBtn.disabled = false;
    }
  });
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
  statusText.style.color = type === 'success' ? 'var(--success)' : 
                          type === 'error' ? 'var(--error)' : 
                          'var(--text-primary)';
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
      'API Disconnected <span class="status-dot" style="background: var(--error); box-shadow: 0 0 8px var(--error)"></span>';
  }
}
