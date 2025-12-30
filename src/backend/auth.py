"""
Authentication and authorization middleware for SprueCrafter
"""

from functools import wraps
from flask import request, jsonify, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User, db


def token_required(f):
    """
    Decorator to require JWT token authentication
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user or not user.is_active:
                return jsonify({'error': 'Invalid or inactive user'}), 401
            
            g.current_user = user
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid or expired token'}), 401
    
    return decorated


def api_key_required(f):
    """
    Decorator to require API key authentication
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({'error': 'API key required'}), 401
        
        user = User.query.filter_by(api_key=api_key, is_active=True).first()
        
        if not user:
            return jsonify({'error': 'Invalid API key'}), 401
        
        g.current_user = user
        return f(*args, **kwargs)
    
    return decorated


def optional_auth(f):
    """
    Decorator for optional authentication (allows both authenticated and anonymous access)
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        g.current_user = None
        
        # Try JWT token first
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
            if user_id:
                user = User.query.get(user_id)
                if user and user.is_active:
                    g.current_user = user
        except:
            pass
        
        # Try API key if no JWT
        if not g.current_user:
            api_key = request.headers.get('X-API-Key')
            if api_key:
                user = User.query.filter_by(api_key=api_key, is_active=True).first()
                if user:
                    g.current_user = user
        
        return f(*args, **kwargs)
    
    return decorated


def admin_required(f):
    """
    Decorator to require admin privileges
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user or not user.is_active:
                return jsonify({'error': 'Invalid or inactive user'}), 401
            
            if not user.is_admin:
                return jsonify({'error': 'Admin privileges required'}), 403
            
            g.current_user = user
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid or expired token'}), 401
    
    return decorated


def plan_required(required_plans):
    """
    Decorator to require specific subscription plan
    Usage: @plan_required(['pro', 'enterprise'])
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(g, 'current_user') or not g.current_user:
                return jsonify({'error': 'Authentication required'}), 401
            
            if g.current_user.plan not in required_plans:
                return jsonify({
                    'error': 'Upgrade required',
                    'message': f'This feature requires {" or ".join(required_plans)} plan'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated
    return decorator
