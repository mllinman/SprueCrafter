"""
Optional Pro user authentication for SprueCrafter
Free users don't need authentication, only Pro subscribers do
"""

from functools import wraps
from flask import request, jsonify, g
import os

# Simple in-memory Pro user storage
# NOTE: This is intentionally simple for the desktop app use case.
# For production hosted deployments, replace this with:
# - File-based storage (JSON/pickle)
# - SQLite database
# - Redis/memcached
# - Full database (PostgreSQL/MySQL)
# The API remains the same regardless of storage backend.
PRO_USERS = {}
# Format: {api_key: {name, email, stripe_customer_id, stripe_subscription_id}}


def load_pro_users_from_env():
    """Load Pro users from environment variable if configured"""
    # This allows configuring Pro users via environment variables
    # Format: PRO_USERS=key1:name1:email1,key2:name2:email2
    users_str = os.getenv('PRO_USERS', '')
    if users_str:
        for user_data in users_str.split(','):
            parts = user_data.split(':')
            if len(parts) >= 3:
                api_key, name, email = parts[0], parts[1], parts[2]
                PRO_USERS[api_key] = {
                    'name': name,
                    'email': email,
                    'plan': 'pro'
                }


# Load Pro users on module import
load_pro_users_from_env()


def add_pro_user(api_key, name, email, stripe_customer_id=None, stripe_subscription_id=None):
    """Add a Pro user to the system"""
    PRO_USERS[api_key] = {
        'name': name,
        'email': email,
        'plan': 'pro',
        'stripe_customer_id': stripe_customer_id,
        'stripe_subscription_id': stripe_subscription_id
    }


def remove_pro_user(api_key):
    """Remove a Pro user from the system"""
    if api_key in PRO_USERS:
        del PRO_USERS[api_key]


def get_pro_user(api_key):
    """Get Pro user by API key"""
    return PRO_USERS.get(api_key)


def optional_pro_auth(f):
    """
    Decorator for optional Pro authentication
    Free users can access without authentication
    Pro users can optionally authenticate to get enhanced features
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        g.is_pro = False
        g.pro_user = None
        
        # Check for Pro API key in headers
        api_key = request.headers.get('X-API-Key')
        if api_key:
            user = get_pro_user(api_key)
            if user:
                g.is_pro = True
                g.pro_user = user
        
        return f(*args, **kwargs)
    
    return decorated


def require_pro(f):
    """
    Decorator to require Pro subscription
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({
                'error': 'Pro subscription required',
                'message': 'This feature requires a Pro subscription. Please subscribe at https://sprucecrafter.com/pricing'
            }), 401
        
        user = get_pro_user(api_key)
        if not user:
            return jsonify({
                'error': 'Invalid API key',
                'message': 'Your API key is invalid or your subscription has expired.'
            }), 401
        
        g.is_pro = True
        g.pro_user = user
        return f(*args, **kwargs)
    
    return decorated
