"""
Vercel entry point for SprueCrafter Flask API
This file is required by Vercel to properly route requests to the Flask app
"""

from src.backend.app_saas import app

# Vercel expects a variable named 'app'
# This is already defined in app_saas.py, so we just import it

if __name__ == "__main__":
    app.run()
