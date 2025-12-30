/**
 * SprueCrafter Renderer
 * Handles UI interactions and API communication
 */

const { ipcRenderer } = require('electron');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE = 'http://127.0.0.1:5000/api';

let currentFile = null;
let currentFiles = [];

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
      <label>Filename:</label>
      <span>${file.name}</span>
    </div>
    <div>
      <label>Size:</label>
      <span>${formatFileSize(file.size)}</span>
    </div>
    <div>
      <label>Type:</label>
      <span>${file.name.split('.').pop().toUpperCase()}</span>
    </div>
    <div>
      <label>Status:</label>
      <span style="color: var(--accent-success)">Ready</span>
    </div>
  `;
  
  fileInfo.classList.remove('hidden');
  updateStatus('File loaded successfully', 'success');
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
        responseType: 'blob'
      });
      
      // Save converted file
      const savePath = await ipcRenderer.invoke('save-file', 
        `${currentFile.name.split('.')[0]}_converted.${targetFormat}`);
      
      if (savePath) {
        fs.writeFileSync(savePath, response.data);
        showStatus('convert-status', `File converted and saved to ${savePath}`, 'success');
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
        responseType: 'blob'
      });
      
      const savePath = await ipcRenderer.invoke('save-file', 
        `${currentFile.name.split('.')[0]}_scaled.stl`);
      
      if (savePath) {
        fs.writeFileSync(savePath, response.data);
        showStatus('scale-status', `Model scaled and saved to ${savePath}`, 'success');
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
          <h4>${category} (${parts.length} parts)</h4>
          ${parts.map(part => `
            <div class="part-item">
              <span>${part.name}</span>
              <span>${part.vertices} vertices</span>
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
        responseType: 'blob'
      });
      
      const savePath = await ipcRenderer.invoke('save-file', 
        `${currentFile.name.split('.')[0]}_rotated.stl`);
      
      if (savePath) {
        fs.writeFileSync(savePath, response.data);
        showStatus('transform-status', 'Model rotated successfully!', 'success');
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
        responseType: 'blob'
      });
      
      const savePath = await ipcRenderer.invoke('save-file', 
        `${currentFile.name.split('.')[0]}_translated.stl`);
      
      if (savePath) {
        fs.writeFileSync(savePath, response.data);
        showStatus('transform-status', 'Model translated successfully!', 'success');
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
      showStatus('supports-status', 'Generating supports...', 'info');
      generateBtn.disabled = true;
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(currentFile.path));
      formData.append('mode', mode);
      formData.append('overhang_angle', overhangAngle);
      formData.append('density', density);
      
      const response = await axios.post(`${API_BASE}/generate-supports`, formData, {
        headers: formData.getHeaders(),
        responseType: mode === 'estimate' ? 'json' : 'blob'
      });
      
      if (mode === 'estimate') {
        displaySupportsInfo(response.data);
        showStatus('supports-status', 'Support estimation complete', 'success');
      } else {
        const savePath = await ipcRenderer.invoke('save-file', 
          `${currentFile.name.split('.')[0]}_with_supports.stl`);
        
        if (savePath) {
          fs.writeFileSync(savePath, response.data);
          showStatus('supports-status', 'Supports generated successfully!', 'success');
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
    <h4>Support Estimation</h4>
    <ul>
      <li><strong>Number of supports:</strong> ${data.num_supports}</li>
      <li><strong>Average height:</strong> ${data.avg_height.toFixed(2)} mm</li>
      <li><strong>Estimated material:</strong> ${data.estimated_material.toFixed(2)} mm³</li>
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
        responseType: 'blob'
      });
      
      const savePath = await ipcRenderer.invoke('save-file', 
        `${currentFile.name.split('.')[0]}_sprue.stl`);
      
      if (savePath) {
        fs.writeFileSync(savePath, response.data);
        showStatus('sprue-status', `Sprue generated and saved to ${savePath}`, 'success');
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
      photoPreview.innerHTML = files.map(file => `
        <img src="${file}" alt="Photo">
      `).join('');
      
      generateModelBtn.classList.remove('hidden');
      showStatus('photo-status', `${files.length} photos selected`, 'success');
    }
  });
  
  generateModelBtn.addEventListener('click', async () => {
    if (currentFiles.length < 2) {
      showStatus('photo-status', 'Please select at least 2 photos', 'error');
      return;
    }
    
    try {
      showStatus('photo-status', 'Generating 3D model from photos...', 'info');
      generateModelBtn.disabled = true;
      
      const formData = new FormData();
      currentFiles.forEach(file => {
        formData.append('files', fs.createReadStream(file));
      });
      
      const response = await axios.post(`${API_BASE}/photo-to-model`, formData, {
        headers: formData.getHeaders(),
        responseType: 'blob'
      });
      
      const savePath = await ipcRenderer.invoke('save-file', 'photo_model.stl');
      
      if (savePath) {
        fs.writeFileSync(savePath, response.data);
        showStatus('photo-status', `3D model generated and saved to ${savePath}`, 'success');
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
  statusText.style.color = type === 'success' ? 'var(--accent-success)' : 
                          type === 'error' ? 'var(--accent-error)' : 
                          'var(--text-primary)';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function checkBackendStatus() {
  try {
    await axios.get(`${API_BASE}/health`, { timeout: 2000 });
    document.getElementById('api-status').innerHTML = 
      'Backend: <span class="status-dot"></span>';
  } catch (error) {
    document.getElementById('api-status').innerHTML = 
      'Backend: <span class="status-dot" style="background: var(--accent-error)"></span>';
  }
}
