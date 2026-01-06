"""
Simplified Stripe integration for Pro subscriptions
Only handles Pro tier subscriptions for SprueCrafter app
"""

import stripe
import os
import secrets
from flask import current_app, request, jsonify
from pro_auth import add_pro_user, remove_pro_user


def init_stripe():
    """Initialize Stripe with API key from environment"""
    api_key = os.getenv('STRIPE_SECRET_KEY')
    if api_key:
        stripe.api_key = api_key
        return True
    return False


def create_pro_checkout_session(email, name=None):
    """
    Create a Stripe Checkout session for Pro subscription
    Returns checkout URL for the user to complete payment
    """
    if not init_stripe():
        raise ValueError("Stripe not configured. Set STRIPE_SECRET_KEY environment variable.")
    
    price_id = os.getenv('STRIPE_PRO_PRICE_ID')
    if not price_id:
        raise ValueError("Stripe Pro price ID not configured. Set STRIPE_PRO_PRICE_ID environment variable.")
    
    # Generate a unique API key for this user
    # NOTE: In production, this API key should be delivered to the user via:
    # 1. Email notification (recommended)
    # 2. Displayed on success page after checkout
    # 3. Available in user dashboard/portal
    # For now, users will need to manually enter it in the app
    api_key = secrets.token_urlsafe(32)
    
    try:
        # Create checkout session
        session = stripe.checkout.Session.create(
            mode='subscription',
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            success_url=os.getenv('STRIPE_SUCCESS_URL', 'http://localhost:5000/pro/success?session_id={CHECKOUT_SESSION_ID}'),
            cancel_url=os.getenv('STRIPE_CANCEL_URL', 'http://localhost:5000/pro/cancel'),
            customer_email=email,
            metadata={
                'api_key': api_key,
                'email': email,
                'name': name or email
            },
            subscription_data={
                'metadata': {
                    'api_key': api_key
                }
            }
        )
        
        return {
            'checkout_url': session.url,
            'session_id': session.id
        }
    except stripe.error.StripeError as e:
        current_app.logger.error(f"Stripe checkout error: {str(e)}")
        raise


def handle_webhook(payload, sig_header):
    """
    Handle Stripe webhook events
    """
    if not init_stripe():
        raise ValueError("Stripe not configured")
    
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    if not webhook_secret:
        raise ValueError("Stripe webhook secret not configured")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        raise ValueError("Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise ValueError("Invalid signature")
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_checkout_completed(session)
    elif event['type'] == 'customer.subscription.created':
        subscription = event['data']['object']
        handle_subscription_created(subscription)
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        handle_subscription_updated(subscription)
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        handle_subscription_deleted(subscription)
    
    return True


def handle_checkout_completed(session):
    """Handle successful checkout"""
    api_key = session.get('metadata', {}).get('api_key')
    email = session.get('customer_email') or session.get('metadata', {}).get('email')
    name = session.get('metadata', {}).get('name', email)
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')
    
    if api_key and email:
        add_pro_user(
            api_key=api_key,
            name=name,
            email=email,
            stripe_customer_id=customer_id,
            stripe_subscription_id=subscription_id
        )
        current_app.logger.info(f"Pro user activated: {email}")


def handle_subscription_created(subscription):
    """Handle subscription creation"""
    api_key = subscription.get('metadata', {}).get('api_key')
    customer_id = subscription.get('customer')
    
    if api_key:
        # Subscription is already handled in checkout_completed
        current_app.logger.info(f"Subscription created for API key: {api_key[:8]}...")


def handle_subscription_updated(subscription):
    """Handle subscription update"""
    api_key = subscription.get('metadata', {}).get('api_key')
    status = subscription.get('status')
    
    if api_key:
        if status == 'active':
            current_app.logger.info(f"Subscription active for API key: {api_key[:8]}...")
        elif status in ['canceled', 'unpaid', 'past_due']:
            # Remove Pro access if subscription is no longer active
            remove_pro_user(api_key)
            current_app.logger.info(f"Pro access removed for API key: {api_key[:8]}... (status: {status})")


def handle_subscription_deleted(subscription):
    """Handle subscription deletion"""
    api_key = subscription.get('metadata', {}).get('api_key')
    
    if api_key:
        remove_pro_user(api_key)
        current_app.logger.info(f"Pro access removed for API key: {api_key[:8]}... (deleted)")


def create_customer_portal_session(customer_id):
    """
    Create a Stripe Customer Portal session for managing subscription
    """
    if not init_stripe():
        raise ValueError("Stripe not configured")
    
    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=os.getenv('STRIPE_RETURN_URL', 'http://localhost:5000')
        )
        return session.url
    except stripe.error.StripeError as e:
        current_app.logger.error(f"Stripe portal error: {str(e)}")
        raise
