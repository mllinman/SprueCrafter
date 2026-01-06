#!/bin/bash
# Health check script for Railway
# This script is called by Railway to check if the application is healthy

# Make a request to the health endpoint
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT:-5000}/api/health)

# Check if the response is 200 OK
if [ "$RESPONSE" = "200" ]; then
    exit 0
else
    exit 1
fi
