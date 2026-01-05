/**
 * Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('auth_token');
    const isGuest = localStorage.getItem('is_guest') === 'true';

    // Auth Check
    if (!token && !isGuest) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize state
    if (isGuest) {
        updateDashboardAsGuest();
    } else {
        await refreshUserData(token);
    }

    // Setup File Upload Logic
    setupUploadArea();
});

async function refreshUserData(token) {
    try {
        const res = await Auth.login ? null : fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Since we are using fetch directly or via Auth if I expanded it
        // Let's stick to fetch for "me" as it's not in Auth yet explicitly (wait, I put it endpoint list but not method)

        const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('user', JSON.stringify(user));
            updateDashboard(user);
        } else {
            if (response.status === 401) {
                Auth.logout();
            }
        }
    } catch (e) {
        console.error("Failed to refresh user data", e);
        // Fallback
        const cachedUser = Auth.getUser();
        if (cachedUser) updateDashboard(cachedUser);
    }
}

function updateDashboardAsGuest() {
    document.getElementById('user-name').textContent = 'Guest';
    document.getElementById('welcome-name').textContent = 'Guest';

    // Status Card -> Upgrade Prompt
    const subStatus = document.getElementById('sub-status');
    if (subStatus) subStatus.textContent = 'Guest Mode';

    const subActionArea = document.getElementById('sub-action-area');
    if (subActionArea) {
        subActionArea.innerHTML = `
            <a href="register.html" class="btn btn-primary" style="width: 100%;">Create Account</a>
            <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.5rem; text-align: center;">Save your work & access Pro features</p>
        `;
    }

    // Lock specialized features
    lockFeature('printers-card', 'Sign in to save custom profiles.');
}

function updateDashboard(user) {
    document.getElementById('user-name').textContent = user.name || user.username || 'User';
    document.getElementById('welcome-name').textContent = (user.name || user.username || 'Creator').split(' ')[0];

    // Subscription Status
    const subStatus = document.getElementById('sub-status');
    const subActionArea = document.getElementById('sub-action-area');

    if (user.is_pro || user.plan === 'pro') {
        if (subStatus) {
            subStatus.textContent = 'Pro Plan';
            subStatus.style.color = '#00f2ff';
        }
        if (subActionArea) {
            subActionArea.innerHTML = `
                <button onclick="handleManageBilling()" class="btn btn-outline" style="width: 100%;">Manage Subscription</button>
            `;
        }
    } else {
        if (subStatus) subStatus.textContent = 'Free Plan';
        if (subActionArea) {
            subActionArea.innerHTML = `
                <a href="pricing.html" class="btn btn-primary" style="width: 100%;">Upgrade to Pro</a>
            `;
        }
    }
}

function lockFeature(cardId, message) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const content = card.querySelector('.card-content');
    if (content) {
        content.style.opacity = '0.5';
        content.style.pointerEvents = 'none';
    }

    const overlay = document.createElement('div');
    overlay.className = 'lock-overlay';
    overlay.innerHTML = `
        <i class="fas fa-lock"></i>
        <p>${message}</p>
        <a href="login.html" class="btn btn-sm btn-primary">Login</a>
    `;
    card.style.position = 'relative';
    card.appendChild(overlay);
}

function setupUploadArea() {
    const dropZone = document.getElementById('upload-zone');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dropZone.addEventListener('dragenter', () => dropZone.classList.add('highlight'));
    dropZone.addEventListener('dragover', () => dropZone.classList.add('highlight'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('highlight'));
    dropZone.addEventListener('drop', handleDrop);

    // Click to upload
    dropZone.addEventListener('click', () => {
        document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleDrop(e) {
        dropZone.classList.remove('highlight');
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
}

function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];

    // Validate file type
    const validExtensions = ['.stl', '.obj', '.fbx', '.3ds', '.ply', '.gltf', '.glb', '.dae'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExt)) {
        const statusArea = document.getElementById('upload-status');
        statusArea.style.display = 'block';
        statusArea.innerHTML = `
            <div style="color: #ef4444; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-circle"></i>
                <span>Unsupported file format. Please upload: ${validExtensions.join(', ')}</span>
            </div>
        `;
        return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
        const statusArea = document.getElementById('upload-status');
        statusArea.style.display = 'block';
        statusArea.innerHTML = `
            <div style="color: #ef4444; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-circle"></i>
                <span>File too large. Maximum size is 100MB.</span>
            </div>
        `;
        return;
    }

    // Show uploading UI
    const statusArea = document.getElementById('upload-status');
    statusArea.style.display = 'block';
    statusArea.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Uploading <strong>${file.name}</strong>...</span>
        </div>
    `;

    // Store file in sessionStorage for editor
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            // Store file data for editor to use
            sessionStorage.setItem('pendingFile', JSON.stringify({
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result
            }));

            statusArea.innerHTML = `
                <div style="color: #4ade80; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-check-circle"></i>
                    <span>Ready! Starting Studio...</span>
                </div>
            `;

            // Redirect to the editor
            setTimeout(() => {
                window.location.href = 'editor.html';
            }, 500);

        } catch (error) {
            console.error('Error processing file:', error);
            statusArea.innerHTML = `
                <div style="color: #ef4444; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Error processing file: ${error.message}</span>
                </div>
            `;
        }
    };

    reader.onerror = function () {
        statusArea.innerHTML = `
            <div style="color: #ef4444; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-circle"></i>
                <span>Error reading file</span>
            </div>
        `;
    };

    // Read file as array buffer for binary formats or text for text formats
    if (['.stl', '.fbx', '.3ds', '.ply', '.glb'].includes(fileExt)) {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file);
    }
}

// Global exposure for HTML inline calls if necessary
window.handleManageBilling = async function () {
    // Re-use logic from main.js or move it here. 
    // Ideally main.js should have universal helpers.
    // For now, I'll assume main.js functions are available globally.
    if (window.handleManageBillingMain) {
        window.handleManageBillingMain();
    }
};
