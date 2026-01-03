"""
Database initialization and migration script for Railway deployment
Run this after deploying to Railway to set up the database schema
"""

import os
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.backend.app_saas import app, db
from src.backend.models import User, PrinterProfile, MarketplaceItem


def init_database():
    """Initialize database with all tables"""
    print("🔧 Initializing database...")
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("✅ Database tables created successfully!")
        
        # Check if admin user exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            print("👤 Creating admin user...")
            admin = User(
                username='admin',
                email='admin@sprucecrafter.com',
                is_admin=True
            )
            admin.set_password('Detroit1977!!')
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin user created!")
        else:
            print("ℹ️  Admin user already exists")
        
        # Add default printer profiles if none exist
        if PrinterProfile.query.count() == 0:
            print("🖨️  Adding default printer profiles...")
            default_printers = [
                {
                    'name': 'Elegoo Saturn 2',
                    'build_volume_x': 219,
                    'build_volume_y': 123,
                    'build_volume_z': 250,
                    'is_public': True
                },
                {
                    'name': 'Anycubic Photon Mono X',
                    'build_volume_x': 192,
                    'build_volume_y': 120,
                    'build_volume_z': 245,
                    'is_public': True
                },
                {
                    'name': 'Phrozen Sonic Mighty 8K',
                    'build_volume_x': 218,
                    'build_volume_y': 123,
                    'build_volume_z': 235,
                    'is_public': True
                }
            ]
            
            for printer_data in default_printers:
                printer = PrinterProfile(**printer_data)
                db.session.add(printer)
            
            db.session.commit()
            print(f"✅ Added {len(default_printers)} default printer profiles!")
        else:
            print("ℹ️  Printer profiles already exist")
        
        print("\n🎉 Database initialization complete!")
        print("\n📊 Database Statistics:")
        print(f"   Users: {User.query.count()}")
        print(f"   Printer Profiles: {PrinterProfile.query.count()}")
        print(f"   Marketplace Items: {MarketplaceItem.query.count()}")


if __name__ == '__main__':
    init_database()
