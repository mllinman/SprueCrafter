/**
 * Main JavaScript for SprueCrafter Website
 * Handles shared functionality like navigation, auth state, and specialized interactions.
 */

const API_BASE = 'https://your-api-url.railway.app/api'; // Replace with actual API URL

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    setupSmoothScroll();
});

function checkAuthState() {
    const token = localStorage.getItem('auth_token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navLinks = document.querySelector('.nav-links');

    if (token && user) {
        // User is logged in
        // Update nav to show "Dashboard" instead of "Log In"
        const loginBtn = navLinks.querySelector('a[href="login.html"]');
        if (loginBtn) {
            loginBtn.textContent = 'Dashboard';
            loginBtn.href = 'dashboard.html';
            loginBtn.classList.remove('btn-outline');
            loginBtn.classList.add('btn-primary'); // Highlight dashboard
        }
        
        // Remove "Get Pro" if they are already pro, or change to "Manage"?
        // For now, let's keep it simple.
    }
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Utility to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}
