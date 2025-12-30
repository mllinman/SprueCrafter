"""
Configuration module for SprueCrafter Backend
Handles environment-based configuration for different deployment scenarios
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///sprucecrafter.db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True
    }
    
    # Redis Configuration
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # File Upload Configuration
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', '/tmp/sprucecrafter/uploads')
    TEMP_FOLDER = os.getenv('TEMP_FOLDER', '/tmp/sprucecrafter/temp')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 524288000))  # 500MB
    ALLOWED_EXTENSIONS = {
        'stl', 'obj', 'fbx', '3ds', 'ply', 'gltf', 'glb', 'dae',
        'jpg', 'jpeg', 'png', 'bmp', 'gif'
    }
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Rate Limiting
    RATELIMIT_ENABLED = os.getenv('RATELIMIT_ENABLED', 'True').lower() == 'true'
    RATELIMIT_DEFAULT = os.getenv('RATELIMIT_DEFAULT', '100 per hour')
    RATELIMIT_STORAGE_URL = os.getenv('RATELIMIT_STORAGE_URL', REDIS_URL)
    
    # AWS S3 Configuration
    USE_S3 = os.getenv('USE_S3', 'False').lower() == 'true'
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_S3_BUCKET = os.getenv('AWS_S3_BUCKET')
    AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # Sentry Configuration
    SENTRY_DSN = os.getenv('SENTRY_DSN')
    
    # Email Configuration
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_USERNAME = os.getenv('SMTP_USERNAME')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
    SMTP_FROM = os.getenv('SMTP_FROM', 'noreply@sprucecrafter.com')
    
    # Feature Flags
    ENABLE_REGISTRATION = os.getenv('ENABLE_REGISTRATION', 'True').lower() == 'true'
    ENABLE_PHOTO_TO_MODEL = os.getenv('ENABLE_PHOTO_TO_MODEL', 'True').lower() == 'true'
    ENABLE_CLOUD_STORAGE = os.getenv('ENABLE_CLOUD_STORAGE', 'False').lower() == 'true'
    
    # Stripe Configuration
    STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY')
    STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
    STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
    STRIPE_PRO_PRICE_ID = os.getenv('STRIPE_PRO_PRICE_ID')  # Price ID for Pro subscription


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    RATELIMIT_ENABLED = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    # Force HTTPS in production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    RATELIMIT_ENABLED = False


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Get configuration based on FLASK_ENV"""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
