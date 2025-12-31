"""
SprueCrafter Marketing & Web App Server
Serves the marketing website and handles Stripe integration
"""

from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_migrate import Migrate
import os
import sys
import logging
from datetime import datetime, timezone

# Add src to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import get_config
from models import db, User
from stripe_utils import (
    create_checkout_session,
    create_customer_portal_session,
    verify_webhook_signature,
    handle_subscription_created,
    handle_subscription_updated,
    handle_subscription_deleted,
    handle_invoice_payment_succeeded,
    handle_invoice_payment_failed
)
from subscription_limits import get_user_usage, get_user_plan_limits

# Initialize Flask app
app = Flask(__name__, 
            static_folder='../../public',
            static_url_path='')

config = get_config()
app.config.from_object(config)

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app, origins=config.CORS_ORIGINS)

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Serve marketing website
@app.route('/')
def index():
    """Serve marketing landing page"""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/app')
def app_page():
    """Serve web application"""
    # Serve the Electron app's index.html for web version
    electron_path = os.path.join(os.path.dirname(__file__), '../electron')
    return send_from_directory(electron_path, 'index.html')


# Stripe API endpoints
@app.route('/api/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout():
    """Create a Stripe Checkout session for subscription"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        plan = data.get('plan', 'pro')
        success_url = data.get('success_url')
        cancel_url = data.get('cancel_url')
        
        # Validate plan
        if plan not in ['pro']:
            return jsonify({'error': 'Invalid plan'}), 400
        
        # Check if user already has an active subscription
        if user.subscription_status == 'active' and user.plan == 'pro':
            return jsonify({
                'error': 'You already have an active subscription',
                'portal_url': '/api/customer-portal'
            }), 400
        
        session = create_checkout_session(
            user=user,
            plan=plan,
            success_url=success_url,
            cancel_url=cancel_url
        )
        
        return jsonify({
            'url': session.url,
            'session_id': session.id
        }), 200
        
    except ValueError as e:
        logger.error(f"Checkout validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Checkout session error: {str(e)}")
        return jsonify({'error': 'Failed to create checkout session'}), 500


@app.route('/api/customer-portal', methods=['POST'])
@jwt_required()
def customer_portal():
    """Create a Stripe Customer Portal session"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.stripe_customer_id:
            return jsonify({'error': 'No Stripe customer found'}), 404
        
        data = request.get_json() or {}
        return_url = data.get('return_url')
        
        session = create_customer_portal_session(user, return_url)
        
        return jsonify({
            'url': session.url
        }), 200
        
    except ValueError as e:
        logger.error(f"Portal validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Portal session error: {str(e)}")
        return jsonify({'error': 'Failed to create portal session'}), 500


@app.route('/api/subscription-status', methods=['GET'])
@jwt_required()
def subscription_status():
    """Get current user's subscription status"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get usage and limits
        usage = get_user_usage(user)
        limits = get_user_plan_limits(user)
        
        return jsonify({
            'plan': user.plan,
            'status': user.subscription_status,
            'period_end': user.subscription_period_end.isoformat() if user.subscription_period_end else None,
            'has_stripe_customer': bool(user.stripe_customer_id),
            'usage': usage,
            'limits': limits
        }), 200
        
    except Exception as e:
        logger.error(f"Subscription status error: {str(e)}")
        return jsonify({'error': 'Failed to get subscription status'}), 500


@app.route('/api/stripe-webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook events"""
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = verify_webhook_signature(payload, sig_header)
    except Exception as e:
        logger.error(f"Webhook signature verification failed: {str(e)}")
        return jsonify({'error': 'Invalid signature'}), 400
    
    # Handle different event types
    event_type = event['type']
    event_data = event['data']['object']
    
    try:
        if event_type == 'checkout.session.completed':
            logger.info(f"Checkout session completed: {event_data.get('id')}")
            # Subscription will be handled by subscription.created event
            
        elif event_type == 'customer.subscription.created':
            handle_subscription_created(event_data)
            
        elif event_type == 'customer.subscription.updated':
            handle_subscription_updated(event_data)
            
        elif event_type == 'customer.subscription.deleted':
            handle_subscription_deleted(event_data)
            
        elif event_type == 'invoice.payment_succeeded':
            handle_invoice_payment_succeeded(event_data)
            
        elif event_type == 'invoice.payment_failed':
            handle_invoice_payment_failed(event_data)
            
        else:
            logger.info(f"Unhandled event type: {event_type}")
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        logger.error(f"Error processing webhook {event_type}: {str(e)}")
        return jsonify({'error': 'Webhook processing failed'}), 500


@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'SprueCrafter Marketing & Web App is running',
        'timestamp': datetime.now(timezone.utc).isoformat()
    }), 200


# Error handlers
@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    # For HTML requests, serve the marketing page
    if request.accept_mimetypes.accept_html:
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(e)}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Create upload directories
    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(config.TEMP_FOLDER, exist_ok=True)
    
    # Run the app
    port = int(os.getenv('PORT', 3000))
    app.run(
        host='0.0.0.0',
        port=port,
        debug=config.DEBUG
    )
