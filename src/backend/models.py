"""
Database models for SprueCrafter
"""

from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

db = SQLAlchemy()


class User(db.Model):
    """User model for authentication and authorization"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    api_key = db.Column(db.String(64), unique=True, index=True)
    
    # User details
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    company = db.Column(db.String(100))
    
    # Account status
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    email_verified = db.Column(db.Boolean, default=False)
    
    # Subscription/Plan
    plan = db.Column(db.String(20), default='free')  # free, pro, enterprise
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime)
    
    # Relationships
    files = db.relationship('File', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    jobs = db.relationship('ProcessingJob', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def generate_api_key(self):
        """Generate a new API key"""
        self.api_key = str(uuid.uuid4().hex)
        return self.api_key
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'company': self.company,
            'plan': self.plan,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


class File(db.Model):
    """File upload tracking model"""
    __tablename__ = 'files'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    
    # File information
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50))
    file_size = db.Column(db.BigInteger)
    mime_type = db.Column(db.String(100))
    
    # Storage location
    storage_path = db.Column(db.String(512))  # Local path or S3 key
    storage_type = db.Column(db.String(20), default='local')  # local, s3
    
    # File metadata
    dimensions = db.Column(db.JSON)  # 3D model dimensions
    vertex_count = db.Column(db.Integer)
    face_count = db.Column(db.Integer)
    
    # Status
    status = db.Column(db.String(20), default='uploaded')  # uploaded, processing, processed, failed
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    expires_at = db.Column(db.DateTime)  # For temporary files
    
    def to_dict(self):
        """Convert file to dictionary"""
        return {
            'id': self.id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'dimensions': self.dimensions,
            'vertex_count': self.vertex_count,
            'face_count': self.face_count
        }


class ProcessingJob(db.Model):
    """Processing job tracking model"""
    __tablename__ = 'processing_jobs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    file_id = db.Column(db.String(36), db.ForeignKey('files.id'), index=True)
    
    # Job details
    job_type = db.Column(db.String(50), nullable=False)  # convert, scale, separate, sprue, etc.
    status = db.Column(db.String(20), default='pending', index=True)  # pending, running, completed, failed
    progress = db.Column(db.Integer, default=0)  # 0-100
    
    # Job parameters
    parameters = db.Column(db.JSON)
    
    # Results
    result_file_id = db.Column(db.String(36), db.ForeignKey('files.id'))
    result_data = db.Column(db.JSON)
    error_message = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        """Convert job to dictionary"""
        return {
            'id': self.id,
            'job_type': self.job_type,
            'status': self.status,
            'progress': self.progress,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'result_data': self.result_data,
            'error_message': self.error_message
        }


class ApiUsage(db.Model):
    """API usage tracking for rate limiting and analytics"""
    __tablename__ = 'api_usage'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Request details
    endpoint = db.Column(db.String(255), nullable=False)
    method = db.Column(db.String(10), nullable=False)
    status_code = db.Column(db.Integer)
    
    # Usage metrics
    response_time = db.Column(db.Float)  # in seconds
    request_size = db.Column(db.BigInteger)  # in bytes
    response_size = db.Column(db.BigInteger)  # in bytes
    
    # Client info
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    
    # Timestamp
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    def to_dict(self):
        """Convert usage to dictionary"""
        return {
            'id': self.id,
            'endpoint': self.endpoint,
            'method': self.method,
            'status_code': self.status_code,
            'response_time': self.response_time,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
