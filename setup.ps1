# OrangeHRM UI Automation - Setup Script (Windows)
# This script sets up the project for first-time use

Write-Host "🚀 Setting up OrangeHRM UI Automation Framework..." -ForegroundColor Green
Write-Host ""

# Check Node.js version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node -v
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📥 Installing npm dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Install Playwright browsers
Write-Host "🌐 Installing Playwright browsers..." -ForegroundColor Yellow
npx playwright install
Write-Host "✅ Browsers installed" -ForegroundColor Green
Write-Host ""

# Create .env file
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env file with your configuration" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  .env file already exists, skipping..." -ForegroundColor Cyan
}
Write-Host ""

# Create required directories
Write-Host "📁 Creating required directories..." -ForegroundColor Yellow
$directories = @("reports", "screenshots", "videos", "logs", "reports\traces", "reports\archive")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "✅ Directories created" -ForegroundColor Green
Write-Host ""

# Run type check
Write-Host "🔍 Running TypeScript type check..." -ForegroundColor Yellow
npm run type-check
Write-Host "✅ Type check passed" -ForegroundColor Green
Write-Host ""

# Display next steps
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit .env file with your configuration"
Write-Host "  2. Run tests: npm test"
Write-Host "  3. Run smoke tests: npm run test:smoke"
Write-Host "  4. View help: npm run"
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "  - README.md"
Write-Host "  - .github\copilot-instructions.md"
Write-Host ""
Write-Host "🎉 Happy testing!" -ForegroundColor Green
