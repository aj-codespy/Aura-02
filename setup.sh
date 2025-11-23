#!/bin/bash

# ProjectAura - Development Environment Setup Script
# This script helps set up the development environment for new developers

set -e  # Exit on error

echo "🚀 ProjectAura - Development Setup"
echo "=================================="
echo ""

# Check Node.js
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version is $NODE_VERSION. Version 18+ is recommended."
fi
echo "✅ Node.js $(node -v) found"

# Check npm
echo ""
echo "📦 Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm $(npm -v) found"

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
npm install

# Check for AWS config
echo ""
echo "🔐 Checking AWS configuration..."
if [ ! -f "src/constants/aws-exports.js" ]; then
    echo "⚠️  AWS configuration not found!"
    echo "   Creating from example file..."
    if [ -f "src/constants/aws-exports.example.js" ]; then
        cp src/constants/aws-exports.example.js src/constants/aws-exports.js
        echo "✅ Created src/constants/aws-exports.js"
        echo "   ⚠️  IMPORTANT: Update this file with your AWS Cognito credentials!"
    else
        echo "❌ Example file not found. Please create src/constants/aws-exports.js manually."
    fi
else
    echo "✅ AWS configuration exists"
fi

# Check app.json bundle identifiers
echo ""
echo "📱 Checking app configuration..."
if grep -q "com.yourname.projectaura" app.json; then
    echo "⚠️  Default bundle identifier detected in app.json"
    echo "   Please update 'com.yourname.projectaura' to your own bundle identifier"
else
    echo "✅ Bundle identifier configured"
fi

# Create .env file if it doesn't exist
echo ""
echo "🔧 Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# ProjectAura Environment Variables
# Add any environment-specific configuration here

# API Configuration
# API_BASE_URL=http://192.168.1.100:3000

# Feature Flags
# ENABLE_ANALYTICS=false
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file exists"
fi

# Summary
echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update src/constants/aws-exports.js with your AWS credentials"
echo "2. Update bundle identifiers in app.json"
echo "3. Run 'npm start' to start the development server"
echo ""
echo "For more information, see README.md"
echo "=================================="
