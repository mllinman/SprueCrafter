#!/bin/bash

# Railway Quick Deploy Script for SprueCrafter
# This script helps you deploy SprueCrafter to Railway in minutes

echo "🚂 SprueCrafter Railway Deployment Script"
echo "=========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed!"
fi

echo ""
echo "Step 1: Login to Railway"
echo "------------------------"
railway login

echo ""
echo "Step 2: Initialize Project"
echo "--------------------------"
railway init

echo ""
echo "Step 3: Add PostgreSQL Database"
echo "--------------------------------"
echo "⚠️  Go to Railway Dashboard and add PostgreSQL:"
echo "   1. Open https://railway.app"
echo "   2. Select your project"
echo "   3. Click '+ New' → 'Database' → 'PostgreSQL'"
echo ""
read -p "Press Enter when database is added..."

echo ""
echo "Step 4: Set Environment Variables"
echo "----------------------------------"
echo "Generating secret keys..."

SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
JWT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")

echo "Setting environment variables..."
railway variables set SECRET_KEY="$SECRET_KEY"
railway variables set JWT_SECRET_KEY="$JWT_SECRET_KEY"
railway variables set FLASK_ENV="production"

echo "✅ Core variables set!"
echo ""
echo "⚠️  You still need to add Stripe keys manually:"
echo "   - STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - STRIPE_PRO_PRICE_ID"
echo ""
echo "Go to Railway Dashboard → Variables to add them"
echo ""
read -p "Press Enter when Stripe keys are added..."

echo ""
echo "Step 5: Deploy to Railway"
echo "--------------------------"
echo "Pushing to Railway..."
railway up

echo ""
echo "Step 6: Initialize Database"
echo "----------------------------"
echo "Waiting for deployment to complete..."
sleep 10
echo "Running database initialization..."
railway run python init_db.py

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "✅ Your SprueCrafter API is now live!"
echo ""
echo "Next steps:"
echo "1. Get your app URL: railway domain"
echo "2. Test health endpoint: curl https://your-app.railway.app/api/health"
echo "3. Update frontend API_BASE in src/electron/renderer.js"
echo "4. Configure Stripe webhooks"
echo "5. Test the application!"
echo ""
echo "📚 Full documentation: See railway_deployment.md"
