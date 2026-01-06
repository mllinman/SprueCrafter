# Quick Start: Deploy SprueCrafter on Railway

This is a quick reference guide for deploying SprueCrafter on Railway. For detailed information, see [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md).

## Prerequisites
- Railway account (sign up at https://railway.app)
- GitHub account

## Deploy in 5 Minutes

### Step 1: Fork/Clone Repository
Fork this repository to your GitHub account or push it to your own repository.

### Step 2: Create Railway Project
1. Log in to Railway: https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your SprueCrafter repository
5. Railway will auto-detect configuration from `railway.toml`

### Step 3: Set Environment Variables (Optional)
In Railway dashboard → Variables, add:

**Minimum (for basic deployment):**
```
FLASK_DEBUG=False
```

**For Pro features (Stripe):**
```
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_SUCCESS_URL=https://your-app.railway.app/pro/success?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=https://your-app.railway.app/pro/cancel
STRIPE_RETURN_URL=https://your-app.railway.app
```

### Step 4: Deploy
Railway automatically deploys your application. Wait 3-5 minutes.

### Step 5: Access Your App
Railway provides a URL like: `https://your-app.railway.app`

Click the URL to access SprueCrafter in your browser!

## Test Locally Before Deploying

Run this command to test Railway deployment locally:
```bash
./test_railway_deploy.sh
```

## Configuration Files

Railway uses these files (already included):
- `railway.toml` - Railway configuration
- `Procfile` - Process definition
- `nixpacks.toml` - Build configuration
- `runtime.txt` - Python version (3.9)
- `requirements.txt` - Python dependencies

## Features Available in Web Mode

✅ All features from desktop app:
- 3D file conversion (STL, OBJ, FBX, etc.)
- Model scaling (1/35, 1/48, 1/72, custom)
- Automatic part separation
- Sprue generation (multiple connector types)
- Model transformations
- Support generation
- Photo-to-3D conversion
- 3D viewer
- Pro subscription support (optional)

## Architecture

```
Browser → Railway (Flask + Python) → 3D Processing
```

No Electron, no local installation required!

## Troubleshooting

### Build Fails
- Check Railway logs for errors
- Verify Python version in `runtime.txt` matches requirements

### App Doesn't Start
- Ensure environment variables are set
- Check logs in Railway dashboard

### 3D Processing Errors
- Large files may timeout (increase in `Procfile`)
- May need to upgrade Railway plan for larger models

## Support

- Full deployment guide: [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
- Railway docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub issues: https://github.com/mllinman/SprueCrafter/issues

## Cost

- **Free Tier**: $0 (500 hours/month, perfect for testing)
- **Hobby**: $5/month (500 more hours)
- **Pro**: $20/month (unlimited hours, more resources)

---

**That's it!** Your SprueCrafter SaaS is now live and accessible from any device with a web browser. 🎉
