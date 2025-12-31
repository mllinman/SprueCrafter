"""
Stripe payment integration for SprueCrafter subscriptions
"""

import stripe
import os
from flask import current_app, request, jsonify
from datetime import datetime, timezone
from .models import db, User


def init_stripe():
    """Initialize Stripe with API key"""
    stripe.api_key = current_app.config.get('STRIPE_SECRET_KEY')


def create_stripe_customer(user):
    """Create a Stripe customer for a user"""
    try:
        init_stripe()
        
        customer = stripe.Customer.create(
            email=user.email,
            name=user.username,
            metadata={
                'user_id': user.id,
                'username': user.username
            }
        )
        
        user.stripe_customer_id = customer.id
        db.session.commit()
        
        return customer
    except stripe.error.StripeError as e:
        current_app.logger.error(f"Stripe customer creation error: {str(e)}")
        raise


def create_checkout_session(user, plan='pro', success_url=None, cancel_url=None):
    """Create a Stripe Checkout session for subscription"""
    try:
        init_stripe()
        
        # Create customer if doesn't exist
        if not user.stripe_customer_id:
            customer = create_stripe_customer(user)
        else:
            customer = stripe.Customer.retrieve(user.stripe_customer_id)
        
        # Get price ID based on plan
        if plan == 'pro':
            price_id = current_app.config.get('STRIPE_PRO_PRICE_ID')
        else:
            raise ValueError(f"Unknown plan: {plan}")
        
        if not price_id:
            raise ValueError("Stripe price ID not configured")
        
        # Set default URLs if not provided
        if not success_url:
            success_url = f"{request.url_root}app?payment=success"
        if not cancel_url:
            cancel_url = f"{request.url_root}?payment=cancelled"
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=customer.id,
            mode='subscription',
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': user.id,
                'plan': plan
            },
            subscription_data={
                'metadata': {
                    'user_id': user.id
                }
            }
        )
        
        return session
    except stripe.error.StripeError as e:
        current_app.logger.error(f"Stripe checkout session error: {str(e)}")
        raise


def create_customer_portal_session(user, return_url=None):
    """Create a Stripe Customer Portal session for managing subscription"""
    try:
        init_stripe()
        
        if not user.stripe_customer_id:
            raise ValueError("User does not have a Stripe customer ID")
        
        if not return_url:
            return_url = f"{request.url_root}app"
        
        session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url=return_url,
        )
        
        return session
    except stripe.error.StripeError as e:
        current_app.logger.error(f"Stripe portal session error: {str(e)}")
        raise


def handle_subscription_created(subscription):
    """Handle subscription.created webhook event"""
    try:
        user_id = subscription.metadata.get('user_id')
        if not user_id:
            current_app.logger.error("No user_id in subscription metadata")
            return
        
        user = User.query.get(user_id)
        if not user:
            current_app.logger.error(f"User not found: {user_id}")
            return
        
        user.stripe_subscription_id = subscription.id
        user.subscription_status = subscription.status
        user.subscription_period_end = datetime.fromtimestamp(
            subscription.current_period_end, 
            tz=timezone.utc
        )
        
        # Update plan based on subscription
        if subscription.status == 'active':
            user.plan = 'pro'
        
        db.session.commit()
        current_app.logger.info(f"Subscription created for user {user_id}")
    except Exception as e:
        current_app.logger.error(f"Error handling subscription created: {str(e)}")
        raise


def handle_subscription_updated(subscription):
    """Handle subscription.updated webhook event"""
    try:
        user = User.query.filter_by(stripe_subscription_id=subscription.id).first()
        if not user:
            current_app.logger.error(f"User not found for subscription: {subscription.id}")
            return
        
        user.subscription_status = subscription.status
        user.subscription_period_end = datetime.fromtimestamp(
            subscription.current_period_end,
            tz=timezone.utc
        )
        
        # Update plan based on status
        if subscription.status == 'active':
            user.plan = 'pro'
        elif subscription.status in ['canceled', 'unpaid', 'past_due']:
            user.plan = 'free'
        
        db.session.commit()
        current_app.logger.info(f"Subscription updated for user {user.id}")
    except Exception as e:
        current_app.logger.error(f"Error handling subscription updated: {str(e)}")
        raise


def handle_subscription_deleted(subscription):
    """Handle subscription.deleted webhook event"""
    try:
        user = User.query.filter_by(stripe_subscription_id=subscription.id).first()
        if not user:
            current_app.logger.error(f"User not found for subscription: {subscription.id}")
            return
        
        user.subscription_status = 'canceled'
        user.plan = 'free'
        
        db.session.commit()
        current_app.logger.info(f"Subscription deleted for user {user.id}")
    except Exception as e:
        current_app.logger.error(f"Error handling subscription deleted: {str(e)}")
        raise


def handle_invoice_payment_succeeded(invoice):
    """Handle invoice.payment_succeeded webhook event"""
    try:
        subscription_id = invoice.subscription
        if not subscription_id:
            return
        
        user = User.query.filter_by(stripe_subscription_id=subscription_id).first()
        if not user:
            current_app.logger.error(f"User not found for subscription: {subscription_id}")
            return
        
        # Ensure user has pro access
        if user.subscription_status == 'active' and user.plan != 'pro':
            user.plan = 'pro'
            db.session.commit()
        
        current_app.logger.info(f"Invoice payment succeeded for user {user.id}")
    except Exception as e:
        current_app.logger.error(f"Error handling invoice payment: {str(e)}")
        raise


def handle_invoice_payment_failed(invoice):
    """Handle invoice.payment_failed webhook event"""
    try:
        subscription_id = invoice.subscription
        if not subscription_id:
            return
        
        user = User.query.filter_by(stripe_subscription_id=subscription_id).first()
        if not user:
            current_app.logger.error(f"User not found for subscription: {subscription_id}")
            return
        
        user.subscription_status = 'past_due'
        
        db.session.commit()
        current_app.logger.warning(f"Invoice payment failed for user {user.id}")
        
        # TODO: Send email notification to user
    except Exception as e:
        current_app.logger.error(f"Error handling invoice failure: {str(e)}")
        raise


def verify_webhook_signature(payload, signature):
    """Verify Stripe webhook signature"""
    try:
        webhook_secret = current_app.config.get('STRIPE_WEBHOOK_SECRET')
        if not webhook_secret:
            raise ValueError("Stripe webhook secret not configured")
        
        event = stripe.Webhook.construct_event(
            payload, signature, webhook_secret
        )
        return event
    except ValueError as e:
        current_app.logger.error(f"Invalid webhook payload: {str(e)}")
        raise
    except stripe.error.SignatureVerificationError as e:
        current_app.logger.error(f"Invalid webhook signature: {str(e)}")
        raise
