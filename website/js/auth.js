/**
 * Authentication Module for SprueCrafter
 * Handles login, registration, logout, and token management.
 */

const Auth = {
    // API Endpoints (Relative paths to match backend serving)
    endpoints: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        me: '/api/auth/me'
    },

    /**
     * Register a new user
     * @param {string} username 
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<object>} Result object
     */
    async register(username, email, password) {
        try {
            const response = await fetch(this.endpoints.register, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            // Check content type before parsing
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                return { success: false, error: `Server error: ${text.substring(0, 100)}` };
            }

            if (!response.ok) {
                return { success: false, error: data.error || 'Registration failed.' };
            }

            return { success: true, data };

        } catch (error) {
            console.error('Registration Error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    },
    
    /**
     * Attempt to log in with username/email and password
     * @param {string} usernameOrEmail 
     * @param {string} password 
     * @returns {Promise<object>} Result object { success: boolean, data?: object, error?: string }
     */
    async login(usernameOrEmail, password) {
        try {
            const response = await fetch(this.endpoints.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: usernameOrEmail, 
                    password: password 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return { 
                    success: false, 
                    error: data.error || 'Login failed. Please check your credentials.' 
                };
            }

            // Success - Store tokens
            this.setSession(data);
            return { success: true, data };

        } catch (error) {
            console.error('Login Error:', error);
            return { 
                success: false, 
                error: 'Unable to connect to server. Please try again later.' 
            };
        }
    },

    /**
     * Log out the current user
     */
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('is_guest');
        window.location.href = 'login.html';
    },

    /**
     * Store auth data in localStorage
     * @param {object} data - Response data from login/register
     */
    setSession(data) {
        if (data.access_token) {
            localStorage.setItem('auth_token', data.access_token);
        }
        if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
        }
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        // Clear guest mode if it was active
        localStorage.removeItem('is_guest');
    },

    /**
     * Check if user is currently authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const token = localStorage.getItem('auth_token');
        // Ideally we would check expiration too, but simple check for now
        return !!token;
    },

    /**
     * Get current user object
     * @returns {object|null}
     */
    getUser() {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    },

    /**
     * Enable Guest Mode
     */
    continueAsGuest() {
        // Manually clear session to avoid redirect behavior of this.logout()
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        localStorage.setItem('is_guest', 'true');
        window.location.href = 'dashboard.html';
    }
};

// Export for global usage if needed, or just window
window.Auth = Auth;
