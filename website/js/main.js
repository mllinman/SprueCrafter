/**
 * Main JavaScript for SprueCrafter Website
 * Handles shared functionality like navigation, auth state, and specialized interactions.
 */

// API Configuration
const API_BASE = ''; // Using relative paths for same-origin serving


document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    setupSmoothScroll();
});

function checkAuthState() {
    const isLoggedIn = localStorage.getItem('auth_token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isGuest = localStorage.getItem('is_guest');
    const navLinks = document.querySelector('.nav-links');

    if (!navLinks) return; // Guard clause if nav doesn't exist on page

    if (isLoggedIn || isGuest) {
        // User is logged in or guest
        const loginBtn = navLinks.querySelector('a[href="login.html"]');
        if (loginBtn) {
            loginBtn.textContent = 'Dashboard';
            loginBtn.href = 'dashboard.html';
            loginBtn.classList.remove('btn-outline');
            loginBtn.classList.add('btn-primary');
        }
        
        // Add Logout Button if not present
        if (!document.getElementById('nav-logout')) {
            const logoutLi = document.createElement('li');
            logoutLi.innerHTML = `<a href="#" id="nav-logout" style="color: var(--text-secondary);">Logout</a>`;
            navLinks.appendChild(logoutLi);
            
            logoutLi.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                // If Auth module is loaded, use it, else manual partial cleanup
                if (window.Auth) {
                    window.Auth.logout();
                } else {
                    localStorage.clear();
                    window.location.href = 'index.html';
                }
            });
        }
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

window.handleManageBillingMain = handleManageBilling;

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

// Guest Login Handler (Deprecated here, moved to Auth.js but kept for compatibility if needed)
function handleGuestLogin() {
   if (window.Auth) {
       window.Auth.continueAsGuest();
   } else {
        localStorage.setItem('is_guest', 'true');
        window.location.href = 'dashboard.html';
   }
}
