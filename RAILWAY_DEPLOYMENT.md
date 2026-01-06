# SprueCrafter Railway Deployment Guide

This guide explains how to deploy SprueCrafter as a SaaS application on Railway.

## Overview

SprueCrafter can run in two modes:
1. **Desktop Mode**: Electron application with local Python backend (original mode)
2. **Web/SaaS Mode**: Web application deployed on Railway or similar platforms (new mode)

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub account (for automatic deployments)

## Deployment Steps

### 1. Connect Repository to Railway

1. Log in to Railway: https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose the `SprueCrafter` repository
5. Railway will automatically detect the configuration from `railway.toml`

### 2. Configure Environment Variables

In the Railway dashboard, add the following environment variables:

#### Required Variables:
```
HOST=0.0.0.0
FLASK_DEBUG=False
UPLOAD_FOLDER=/tmp/sprucecrafter-uploads
```

**Note:** Railway automatically provides the `PORT` environment variable - do NOT set it manually.

#### Optional - For Pro Subscriptions (Stripe):
```
STRIPE_SECRET_KEY=sk_live_xxxxx  # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Your Stripe webhook secret
STRIPE_PRO_PRICE_ID=price_xxxxx  # Your Stripe price ID for Pro plan
STRIPE_SUCCESS_URL=https://your-app.railway.app/pro/success?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=https://your-app.railway.app/pro/cancel
STRIPE_RETURN_URL=https://your-app.railway.app
```

#### Optional - Pre-configured Pro Users:
```
PRO_USERS=api_key:User Name:user@example.com
```

### 3. Deploy

Railway will automatically:
- Detect Python 3.9 from `runtime.txt`
- Install dependencies from `requirements.txt`
- Start the application using the command from `Procfile`

The deployment typically takes 3-5 minutes.

### 4. Access Your Application

Once deployed, Railway provides a URL like:
```
https://your-app.railway.app
```

Visit this URL to access the SprueCrafter web interface.

### 5. Set Up Custom Domain (Optional)

1. In Railway dashboard, go to your project
2. Click on **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed by Railway
5. Update `STRIPE_*_URL` variables if using Stripe

## Configuration Files

SprueCrafter includes several Railway-specific configuration files:

### `railway.toml`
Main Railway configuration:
- Build settings
- Start command
- Health check configuration

### `Procfile`
Process configuration for Railway:
```
web: gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 --worker-class sync src.backend.app:app
```

### `nixpacks.toml`
Build configuration for Nixpacks (Railway's build system):
- System dependencies (Python, gcc, libGL)
- Build phases

### `runtime.txt`
Specifies Python version:
```
python-3.9.21
```

## Architecture

### Web Mode Architecture

```
┌─────────────┐
│   Browser   │
│  (Web UI)   │
└──────┬──────┘
       │ HTTP/HTTPS
       │
┌──────▼───────────────┐
│  Flask Application   │
│  - Serves Web UI     │
│  - API Endpoints     │
│  - File Processing   │
└──────────────────────┘
       │
┌──────▼───────────────┐
│  Python Backend      │
│  - 3D Processing     │
│  - Sprue Generation  │
│  - File Conversion   │
└──────────────────────┘
```

### Desktop Mode Architecture (Original)

```
┌─────────────┐
│  Electron   │
│    (UI)     │
└──────┬──────┘
       │ IPC
┌──────▼──────┐      ┌──────────────┐
│   Python    │◄────►│  Flask API   │
│   Backend   │      │ (localhost)  │
└─────────────┘      └──────────────┘
```

## Features in Web Mode

All features from the desktop application are available in web mode:
- ✅ 3D file import and conversion
- ✅ Model scaling (1/35, 1/48, 1/72, 1/144, custom)
- ✅ Automatic part separation
- ✅ Sprue generation with multiple connector types
- ✅ Model transformation (rotate, translate, scale)
- ✅ Support generation
- ✅ Photo-to-3D conversion
- ✅ 3D viewer
- ✅ Pro subscription support (with Stripe)

## Performance Considerations

### Railway Free Tier
- 500 hours of execution time per month
- Shared CPU and RAM
- $5 usage credit
- Suitable for testing and light usage

### Railway Pro Tier
- Higher resource limits
- Better performance for 3D processing
- Custom domains included
- Recommended for production use

### Optimization Tips

1. **File Size Limits**: Railway has disk space limits. Consider:
   - Cleaning up temporary files regularly
   - Using object storage (S3, etc.) for large files
   - Implementing file retention policies

2. **Processing Timeout**: Large 3D models may timeout. Consider:
   - Increasing worker timeout in `Procfile` (currently 120s)
   - Using background job processing for large files
   - Implementing progress callbacks

3. **Memory Usage**: 3D processing can be memory-intensive:
   - Monitor memory usage in Railway dashboard
   - Optimize mesh processing algorithms
   - Consider upgrading Railway plan for larger models

## Monitoring and Logs

View application logs in Railway dashboard:
1. Go to your project
2. Click on the deployment
3. View **Logs** tab

Health check endpoint:
```
GET https://your-app.railway.app/api/health
```

## Troubleshooting

### Application Won't Start
- Check Railway logs for errors
- Verify all environment variables are set correctly
- Ensure Python version matches `runtime.txt`

### 3D Processing Failures
- Check if model file is too large
- Verify file format is supported
- Monitor memory usage (may need to upgrade plan)

### Pro Subscription Issues
- Verify Stripe keys are correct
- Check webhook endpoint is configured in Stripe dashboard
- Ensure URLs are updated with your domain

### File Upload Errors
- Check UPLOAD_FOLDER is set to `/tmp/sprucecrafter-uploads`
- Verify Railway has sufficient disk space
- Check file size limits (500MB max)

## Maintenance

### Updating the Application
1. Push changes to GitHub
2. Railway automatically detects and deploys changes
3. Monitor deployment logs for issues

### Database/Storage (Future)
Current version uses temporary file storage. For production:
- Consider adding PostgreSQL for user data
- Use S3 or similar for file storage
- Implement user authentication

## Security Considerations

1. **Environment Variables**: Never commit `.env` file
2. **API Keys**: Use Railway's encrypted environment variables
3. **File Uploads**: Implement additional validation for production
4. **CORS**: Update CORS settings in `app.py` for your domain
5. **Rate Limiting**: Consider adding rate limiting for production use

## Cost Estimation

### Railway Costs (Approximate)
- **Free Tier**: $0 (500 hours/month)
- **Hobby Plan**: $5/month (500 additional hours)
- **Pro Plan**: $20/month (unlimited hours, more resources)

### Additional Costs (Optional)
- **Stripe Fees**: 2.9% + $0.30 per transaction (if using Pro subscriptions)
- **Custom Domain**: Varies by registrar
- **Object Storage**: If implementing S3 for files

## Support

For issues specific to Railway deployment:
- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

For SprueCrafter issues:
- GitHub Issues: https://github.com/mllinman/SprueCrafter/issues

## Next Steps

After deployment:
1. Test all features thoroughly
2. Configure custom domain (optional)
3. Set up Stripe for Pro subscriptions (optional)
4. Monitor performance and adjust resources as needed
5. Consider implementing user authentication for multi-user deployments

---

**Note**: The web version serves the same powerful 3D processing capabilities as the desktop application, making professional sprue generation accessible from any device with a web browser.
