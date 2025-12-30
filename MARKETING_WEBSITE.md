# SprueCrafter Marketing Website & Stripe Integration

This document describes the marketing website and Stripe payment integration for SprueCrafter.

## Overview

The marketing website is a beautiful, modern, dark-themed landing page that showcases SprueCrafter's features and allows users to subscribe to the Pro tier via Stripe.

## Features

### Marketing Website
- **Modern Dark Design**: Matches the app's color scheme with cyan accent (#00e5ff)
- **Responsive Layout**: Works on all devices
- **Smooth Animations**: Engaging user experience with scroll animations
- **Hero Section**: Eye-catching introduction with statistics
- **Features Showcase**: Highlights key capabilities
- **Pricing Section**: Clear comparison of Free vs Pro tiers
- **About Section**: Detailed information about the product

### Subscription Tiers

#### Free Tier
- 10 conversions per month
- Basic file format support
- 1 GB storage
- Community support
- **Price**: $0/forever

#### Pro Tier
- Unlimited conversions
- All file formats
- 50 GB storage
- Priority support
- Advanced sprue generation
- Full API access
- **Price**: $10/month

## Setup Instructions

### 1. Install Dependencies

```bash
# Install Python dependencies (includes Stripe)
pip install -r requirements.txt
pip install -r requirements.prod.txt
```

### 2. Configure Stripe

1. **Create Stripe Account**
   - Go to https://stripe.com and create an account
   - Get your API keys from the Dashboard

2. **Create Product and Price**
   ```bash
   # In Stripe Dashboard:
   # 1. Go to Products
   # 2. Create a new product called "SprueCrafter Pro"
   # 3. Add a recurring price of $10/month
   # 4. Copy the Price ID (starts with price_)
   ```

3. **Configure Webhook**
   ```bash
   # In Stripe Dashboard:
   # 1. Go to Developers > Webhooks
   # 2. Add endpoint: https://yourdomain.com/api/stripe-webhook
   # 3. Select these events:
   #    - checkout.session.completed
   #    - customer.subscription.created
   #    - customer.subscription.updated
   #    - customer.subscription.deleted
   #    - invoice.payment_succeeded
   #    - invoice.payment_failed
   # 4. Copy the Webhook signing secret
   ```

4. **Update Environment Variables**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Edit .env and add your Stripe keys:
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRO_PRICE_ID=price_...
   ```

### 3. Database Migration

Add Stripe fields to the User model:

```bash
# Generate migration
flask db migrate -m "Add Stripe fields to User model"

# Apply migration
flask db upgrade
```

### 4. Run the Marketing Website

```bash
# Development mode
python src/backend/app_web.py

# Or with npm
npm run dev:web

# Access at http://localhost:3000
```

### 5. Test Stripe Integration

Use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Any future expiry date and any 3-digit CVC

## Architecture

```
┌─────────────────────────────────────────────┐
│         Marketing Website                   │
│         (public/index.html)                 │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│         Web App Server                      │
│         (app_web.py)                        │
├─────────────────────────────────────────────┤
│  Routes:                                    │
│  - GET  /                Landing page       │
│  - GET  /app             Launch app         │
│  - POST /api/create-checkout-session        │
│  - POST /api/customer-portal                │
│  - GET  /api/subscription-status            │
│  - POST /api/stripe-webhook                 │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│         Stripe API                          │
│         (Payment Processing)                │
└─────────────────────────────────────────────┘
```

## API Endpoints

### Create Checkout Session
```http
POST /api/create-checkout-session
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "plan": "pro",
  "success_url": "https://yourdomain.com/app?payment=success",
  "cancel_url": "https://yourdomain.com/?payment=cancelled"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/...",
  "session_id": "cs_..."
}
```

### Get Subscription Status
```http
GET /api/subscription-status
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "plan": "pro",
  "status": "active",
  "period_end": "2024-02-01T00:00:00Z",
  "has_stripe_customer": true,
  "usage": {
    "conversions_this_month": 25,
    "storage_used_gb": 2.5,
    "active_jobs": 1
  },
  "limits": {
    "conversions_per_month": null,
    "storage_gb": 50,
    "max_file_size_mb": 500
  }
}
```

### Customer Portal
```http
POST /api/customer-portal
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "return_url": "https://yourdomain.com/app"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

## Subscription Limits Enforcement

The system automatically enforces limits based on the user's plan:

### Free Tier Limits
- 10 conversions per month
- 1 GB storage
- 100 MB max file size
- 1 concurrent job
- No API access
- No advanced features

### Pro Tier Benefits
- Unlimited conversions
- 50 GB storage
- 500 MB max file size
- 5 concurrent jobs
- Full API access
- All advanced features

### Usage Decorators

Use these decorators to enforce limits:

```python
from subscription_limits import (
    require_conversion_limit,
    require_storage_available,
    require_concurrent_jobs,
    require_feature
)

@app.route('/api/convert')
@token_required
@require_conversion_limit
@require_storage_available
def convert_file():
    # Your code here
    pass

@app.route('/api/advanced-feature')
@token_required
@require_feature('advanced_features')
def advanced_feature():
    # Your code here
    pass
```

## Webhook Events

The system handles these Stripe webhook events:

1. **checkout.session.completed**: When checkout is successful
2. **customer.subscription.created**: When subscription starts
3. **customer.subscription.updated**: When subscription changes
4. **customer.subscription.deleted**: When subscription cancels
5. **invoice.payment_succeeded**: When payment succeeds
6. **invoice.payment_failed**: When payment fails

## Testing

### Test Stripe Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

## Deployment

### Docker

The `Dockerfile.web` is configured to run the marketing website:

```bash
docker build -f Dockerfile.web -t sprucecrafter-web .
docker run -p 3000:3000 --env-file .env sprucecrafter-web
```

### Docker Compose

```bash
docker-compose up -d web
```

### Production Considerations

1. **Use HTTPS**: Required for Stripe webhooks
2. **Set Strong Secrets**: Change all default keys
3. **Enable Webhook Signature Verification**: Always verify webhook signatures
4. **Monitor Webhook Failures**: Set up alerts for failed webhooks
5. **Handle Edge Cases**: Failed payments, subscription updates, etc.
6. **Backup Database**: Regular backups of user and subscription data

## Security Best Practices

1. **Never expose secret keys**: Only use publishable key on frontend
2. **Verify webhook signatures**: Always verify Stripe webhook signatures
3. **Use HTTPS in production**: Required for secure payment processing
4. **Validate user input**: Sanitize all user inputs
5. **Rate limit API endpoints**: Prevent abuse
6. **Log security events**: Monitor for suspicious activity

## Customization

### Styling

Edit `public/css/styles.css` to customize:
- Colors and themes
- Layout and spacing
- Animations and transitions

### Content

Edit `public/index.html` to customize:
- Copy and messaging
- Features and benefits
- Pricing tiers

### Pricing

To change pricing:
1. Update Stripe product/price in Dashboard
2. Update `STRIPE_PRO_PRICE_ID` in `.env`
3. Update pricing display in `public/index.html`
4. Update limits in `src/backend/subscription_limits.py`

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct and publicly accessible
2. Verify webhook secret is correct in `.env`
3. Check Stripe Dashboard > Developers > Webhooks for failed deliveries
4. Ensure HTTPS is enabled in production

### Checkout Session Fails

1. Verify Stripe keys are correct
2. Check price ID is valid
3. Ensure customer is created successfully
4. Review logs for error messages

### Subscription Not Updating

1. Check webhook events are being received
2. Verify webhook signature verification
3. Check database connection
4. Review application logs

## Support

For issues or questions:
- GitHub Issues: https://github.com/mllinman/SprueCrafter/issues
- Email: support@sprucecrafter.com
- Documentation: See docs/ directory

## License

MIT License - See LICENSE file for details
