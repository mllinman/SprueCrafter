/**
 * Datasets Management Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    loadDatasets();
    
    // Set user name
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    if(user.username) document.getElementById('user-name').textContent = user.username;
});

const API_DATASETS = '/api/datasets';

// --- Loading ---

async function loadDatasets() {
    const list = document.getElementById('datasets-list');
    
    try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get(API_DATASETS, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const datasets = res.data;
        
        if (datasets.length === 0) {
            list.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem; background: rgba(255,255,255,0.02); border-radius: 16px;">
                    <i class="fas fa-database" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3>No datasets found</h3>
                    <p style="color: var(--text-muted);">Upload a CSV file to get started.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = datasets.map(d => `
            <div class="dataset-card">
                <div class="dataset-header">
                    <div class="dataset-icon">
                        <i class="fas fa-file-csv"></i>
                    </div>
                    <button onclick="deleteDataset('${d.id}')" class="btn-icon" style="color: #ef4444; background: none; border: none; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <h3>${d.filename.split('_').slice(1).join('_')}</h3>
                <div class="dataset-meta">
                    <span><i class="fas fa-list"></i> ${d.row_count} Rows</span>
                    <span><i class="fas fa-hdd"></i> ${d.file_size}</span>
                </div>
                <div class="dataset-columns" title="${d.columns.join(', ')}">
                    <strong>Cols:</strong> ${d.columns.slice(0, 3).join(', ')}${d.columns.length > 3 ? '...' : ''}
                </div>
                <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
                    Uploaded: ${new Date(d.created_at).toLocaleDateString()}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error(error);
        list.innerHTML = `<div style="color: #ef4444;">Error loading datasets: ${error.message}</div>`;
    }
}

// --- Uploading ---

function showUploadModal() {
    document.getElementById('upload-modal').classList.add('active');
}

function hideUploadModal() {
    document.getElementById('upload-modal').classList.remove('active');
    document.getElementById('csv-input').value = '';
}

async function handleUpload() {
    const fileInput = document.getElementById('csv-input');
    const file = fileInput.files[0];
    
    if (!file) return alert("Please select a file");
    
    const btn = document.getElementById('upload-confirm-btn');
    btn.textContent = "Uploading...";
    btn.disabled = true;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const token = localStorage.getItem('auth_token');
        await axios.post(API_DATASETS, formData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        hideUploadModal();
        loadDatasets();
        
    } catch (error) {
        console.error(error);
        alert(`Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
        btn.textContent = "Upload";
        btn.disabled = false;
    }
}

// --- Deleting ---

async function deleteDataset(id) {
    if(!confirm("Are you sure you want to delete this dataset?")) return;
    
    try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`${API_DATASETS}/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadDatasets();
    } catch (error) {
        alert("Delete failed.");
    }
}
