#!/bin/bash

# OrangeHRM UI Automation - Setup Script
# This script sets up the project for first-time use

set -e

echo "🚀 Setting up OrangeHRM UI Automation Framework..."
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "✅ Node.js version: $NODE_VERSION"
echo ""

# Install dependencies
echo "📥 Installing npm dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install
echo "✅ Browsers installed"
echo ""

# Create .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env file with your configuration"
else
    echo "ℹ️  .env file already exists, skipping..."
fi
echo ""

# Create required directories
echo "📁 Creating required directories..."
mkdir -p reports screenshots videos logs
mkdir -p reports/traces reports/archive
echo "✅ Directories created"
echo ""

# Run type check
echo "🔍 Running TypeScript type check..."
npm run type-check
echo "✅ Type check passed"
echo ""

# Display next steps
echo "✨ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Edit .env file with your configuration"
echo "  2. Run tests: npm test"
echo "  3. Run smoke tests: npm run test:smoke"
echo "  4. View help: npm run --help"
echo ""
echo "📖 Documentation:"
echo "  - README.md"
echo "  - .github/copilot-instructions.md"
echo ""
echo "🎉 Happy testing!"
