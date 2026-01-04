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

// Billing / Cashflow Functions
async function handleSubscribe(priceId) {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html?redirect=pricing';
        return;
    }

    try {
        const response = await fetch('/api/billing/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ price_id: priceId })
        });
        
        const data = await response.json();
        
        if (data.checkoutUrl) {
            // Redirect to Stripe Checkout
            window.location.href = data.checkoutUrl;
        } else {
            console.error('Checkout error:', data.error);
            alert('Unable to start checkout. Please try again.');
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Communication error. Please check connection.');
    }
}

async function handleManageBilling() {
    const token = localStorage.getItem('auth_token');
    
    // Check if user is logged in
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/api/billing/create-portal-session', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.portalUrl) {
            window.location.href = data.portalUrl;
        } else {
            alert('Billing portal unavailable: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Portal error:', error);
    }
}

function handleGuestLogin() {
    // Clear existing auth
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Set guest flag
    localStorage.setItem('is_guest', 'true');
    console.log('Guest mode set. Redirecting...');
    
    // Redirect to dashboard with small delay to ensure persistence
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 100);
}
