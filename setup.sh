#!/bin/bash

# SprueCrafter Setup Script
# Installs all dependencies and prepares the application

echo "==================================="
echo "SprueCrafter Setup"
echo "==================================="
echo ""

# Check for Python
echo "Checking for Python..."
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d ' ' -f 2)
echo "Found Python $PYTHON_VERSION"
echo ""

# Check for Node.js
echo "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js 16 or higher"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "Found Node.js $NODE_VERSION"
echo ""

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Error: Failed to install Python dependencies"
    exit 1
fi
echo "Python dependencies installed successfully"
echo ""

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install Node.js dependencies"
    exit 1
fi
echo "Node.js dependencies installed successfully"
echo ""

echo "==================================="
echo "Setup completed successfully!"
echo "==================================="
echo ""
echo "To start SprueCrafter:"
echo "  npm start"
echo ""
echo "For development mode:"
echo "  npm run dev"
echo ""
