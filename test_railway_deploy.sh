#!/bin/bash
# Test Railway deployment locally
# This script simulates Railway's deployment process

echo "========================================="
echo "SprueCrafter Railway Deployment Test"
echo "========================================="
echo ""

# Check if dependencies are installed
echo "1. Checking Python dependencies..."
pip install -r requirements.txt -q
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi
echo "✅ Python dependencies installed"
echo ""

# Check if gunicorn is available
echo "2. Checking gunicorn..."
if ! command -v gunicorn &> /dev/null; then
    echo "❌ gunicorn not found"
    exit 1
fi
echo "✅ gunicorn found"
echo ""

# Set Railway-like environment variables
export PORT=8082
export HOST=0.0.0.0
export FLASK_DEBUG=False
export RAILWAY_ENVIRONMENT=test

echo "3. Testing Flask app startup..."
echo "   Starting server on http://localhost:$PORT"
echo ""

# Start the application with gunicorn (same command as Procfile)
gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --worker-class sync src.backend.app:app &
GUNICORN_PID=$!

# Wait for server to start
sleep 5

# Test health endpoint
echo "4. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:$PORT/api/health)
if [ $? -eq 0 ]; then
    echo "✅ Health endpoint responding"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Health endpoint not responding"
    kill $GUNICORN_PID 2>/dev/null
    exit 1
fi
echo ""

# Test web UI
echo "5. Testing web UI..."
WEB_RESPONSE=$(curl -s http://localhost:$PORT/ | head -n 1)
if [[ $WEB_RESPONSE == *"<!DOCTYPE html>"* ]]; then
    echo "✅ Web UI is being served"
else
    echo "❌ Web UI not serving correctly"
    kill $GUNICORN_PID 2>/dev/null
    exit 1
fi
echo ""

# Test API endpoints
echo "6. Testing API endpoints..."
curl -s http://localhost:$PORT/api/printer-profiles > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ API endpoints responding"
else
    echo "❌ API endpoints not responding"
    kill $GUNICORN_PID 2>/dev/null
    exit 1
fi
echo ""

# Cleanup
echo "7. Stopping server..."
kill $GUNICORN_PID 2>/dev/null
wait $GUNICORN_PID 2>/dev/null
echo "✅ Server stopped"
echo ""

echo "========================================="
echo "✅ All tests passed!"
echo "========================================="
echo ""
echo "Your application is ready for Railway deployment."
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Railway"
echo "3. Set environment variables in Railway dashboard"
echo "4. Deploy!"
echo ""
echo "See RAILWAY_DEPLOYMENT.md for detailed instructions."
