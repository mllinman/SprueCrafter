"""
Subscription tier limits and usage tracking for SprueCrafter
"""

from functools import wraps
from flask import g, jsonify, request
from datetime import datetime, timezone, timedelta
from models import User, ProcessingJob, File, db
from sqlalchemy import func


# Define plan limits
PLAN_LIMITS = {
    'free': {
        'conversions_per_month': 10,
        'storage_gb': 1,
        'max_file_size_mb': 100,
        'concurrent_jobs': 1,
        'api_access': False,
        'advanced_features': False,
        'priority_support': False,
    },
    'pro': {
        'conversions_per_month': None,  # Unlimited
        'storage_gb': 50,
        'max_file_size_mb': 500,
        'concurrent_jobs': 5,
        'api_access': True,
        'advanced_features': True,
        'priority_support': True,
    },
    'enterprise': {
        'conversions_per_month': None,  # Unlimited
        'storage_gb': None,  # Unlimited
        'max_file_size_mb': None,  # Unlimited
        'concurrent_jobs': None,  # Unlimited
        'api_access': True,
        'advanced_features': True,
        'priority_support': True,
    }
}


def get_user_plan_limits(user):
    """Get limits for user's current plan"""
    return PLAN_LIMITS.get(user.plan, PLAN_LIMITS['free'])


def get_user_usage(user):
    """Get current usage statistics for user"""
    # Get current month's start
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Count conversions this month
    conversions_this_month = ProcessingJob.query.filter(
        ProcessingJob.user_id == user.id,
        ProcessingJob.created_at >= month_start,
        ProcessingJob.status == 'completed'
    ).count()
    
    # Calculate total storage used (in GB)
    total_storage_bytes = db.session.query(
        func.sum(File.file_size)
    ).filter(
        File.user_id == user.id
    ).scalar() or 0
    
    storage_used_gb = total_storage_bytes / (1024 ** 3)  # Convert bytes to GB
    
    # Count active jobs
    active_jobs = ProcessingJob.query.filter(
        ProcessingJob.user_id == user.id,
        ProcessingJob.status.in_(['pending', 'running'])
    ).count()
    
    return {
        'conversions_this_month': conversions_this_month,
        'storage_used_gb': round(storage_used_gb, 2),
        'active_jobs': active_jobs,
        'period_start': month_start.isoformat(),
        'period_end': (month_start + timedelta(days=32)).replace(day=1).isoformat()
    }


def check_conversion_limit(user):
    """Check if user has reached conversion limit"""
    limits = get_user_plan_limits(user)
    
    # No limit for unlimited plans
    if limits['conversions_per_month'] is None:
        return True, None
    
    usage = get_user_usage(user)
    conversions_used = usage['conversions_this_month']
    conversions_limit = limits['conversions_per_month']
    
    if conversions_used >= conversions_limit:
        return False, f"Monthly conversion limit reached ({conversions_limit}). Upgrade to Pro for unlimited conversions."
    
    return True, None


def check_storage_limit(user, additional_size_bytes=0):
    """Check if user has enough storage available"""
    limits = get_user_plan_limits(user)
    
    # No limit for unlimited plans
    if limits['storage_gb'] is None:
        return True, None
    
    usage = get_user_usage(user)
    storage_used_gb = usage['storage_used_gb']
    additional_size_gb = additional_size_bytes / (1024 ** 3)
    storage_limit_gb = limits['storage_gb']
    
    if (storage_used_gb + additional_size_gb) > storage_limit_gb:
        return False, f"Storage limit exceeded ({storage_limit_gb} GB). Upgrade to Pro for 50 GB storage."
    
    return True, None


def check_file_size_limit(user, file_size_bytes):
    """Check if file size is within plan limits"""
    limits = get_user_plan_limits(user)
    
    # No limit for unlimited plans
    if limits['max_file_size_mb'] is None:
        return True, None
    
    file_size_mb = file_size_bytes / (1024 ** 2)
    max_size_mb = limits['max_file_size_mb']
    
    if file_size_mb > max_size_mb:
        return False, f"File size exceeds limit ({max_size_mb} MB). Upgrade to Pro for larger files."
    
    return True, None


def check_concurrent_jobs_limit(user):
    """Check if user can start another job"""
    limits = get_user_plan_limits(user)
    
    # No limit for unlimited plans
    if limits['concurrent_jobs'] is None:
        return True, None
    
    usage = get_user_usage(user)
    active_jobs = usage['active_jobs']
    max_jobs = limits['concurrent_jobs']
    
    if active_jobs >= max_jobs:
        return False, f"Maximum concurrent jobs limit reached ({max_jobs}). Please wait for current jobs to complete or upgrade to Pro."
    
    return True, None


def check_feature_access(user, feature):
    """Check if user has access to a specific feature"""
    limits = get_user_plan_limits(user)
    
    feature_map = {
        'api_access': limits['api_access'],
        'advanced_features': limits['advanced_features'],
        'priority_support': limits['priority_support'],
    }
    
    has_access = feature_map.get(feature, False)
    
    if not has_access:
        return False, f"This feature requires Pro plan. Upgrade to access {feature.replace('_', ' ')}."
    
    return True, None


def require_conversion_limit(f):
    """Decorator to check conversion limit before processing"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'current_user') or not g.current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        allowed, message = check_conversion_limit(g.current_user)
        if not allowed:
            return jsonify({
                'error': 'Limit exceeded',
                'message': message,
                'upgrade_url': '/pricing'
            }), 429
        
        return f(*args, **kwargs)
    
    return decorated


def require_storage_available(f):
    """Decorator to check storage limit before file upload"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'current_user') or not g.current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Check if there's a file in the request
        if 'file' in request.files:
            file = request.files['file']
            file.seek(0, 2)  # Seek to end
            file_size = file.tell()
            file.seek(0)  # Reset to beginning
            
            # Check file size limit
            allowed, message = check_file_size_limit(g.current_user, file_size)
            if not allowed:
                return jsonify({
                    'error': 'File too large',
                    'message': message,
                    'upgrade_url': '/pricing'
                }), 413
            
            # Check storage limit
            allowed, message = check_storage_limit(g.current_user, file_size)
            if not allowed:
                return jsonify({
                    'error': 'Storage limit exceeded',
                    'message': message,
                    'upgrade_url': '/pricing'
                }), 507
        
        return f(*args, **kwargs)
    
    return decorated


def require_concurrent_jobs(f):
    """Decorator to check concurrent jobs limit"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'current_user') or not g.current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        allowed, message = check_concurrent_jobs_limit(g.current_user)
        if not allowed:
            return jsonify({
                'error': 'Job limit exceeded',
                'message': message,
                'upgrade_url': '/pricing'
            }), 429
        
        return f(*args, **kwargs)
    
    return decorated


def require_feature(feature_name):
    """Decorator to require specific feature access"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(g, 'current_user') or not g.current_user:
                return jsonify({'error': 'Authentication required'}), 401
            
            allowed, message = check_feature_access(g.current_user, feature_name)
            if not allowed:
                return jsonify({
                    'error': 'Feature not available',
                    'message': message,
                    'upgrade_url': '/pricing'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated
    return decorator
