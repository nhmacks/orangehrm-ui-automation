.PHONY: help install setup test test-smoke test-regression test-dev test-qa test-prod test-headed test-debug report clean lint format type-check

# Default target
help:
	@echo "🧪 OrangeHRM UI Automation - Available Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install          Install dependencies"
	@echo "  make setup            Complete project setup"
	@echo ""
	@echo "Testing:"
	@echo "  make test             Run all tests"
	@echo "  make test-smoke       Run smoke tests only"
	@echo "  make test-regression  Run full regression suite"
	@echo "  make test-dev         Run tests in dev environment"
	@echo "  make test-qa          Run tests in QA environment"
	@echo "  make test-prod        Run tests in production"
	@echo "  make test-headed      Run with visible browser"
	@echo "  make test-debug       Run in debug mode"
	@echo ""
	@echo "Reports:"
	@echo "  make report           Generate HTML report"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint             Run ESLint"
	@echo "  make format           Format code with Prettier"
	@echo "  make type-check       Check TypeScript types"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean            Remove generated files"
	@echo ""

# Installation
install:
	@echo "📦 Installing dependencies..."
	npm install
	npx playwright install

# Complete setup
setup:
	@echo "🚀 Setting up project..."
	npm install
	npx playwright install
	@if [ ! -f .env ]; then cp .env.example .env; echo "✅ .env created"; fi
	@mkdir -p reports screenshots videos logs reports/traces reports/archive
	@echo "✨ Setup complete!"

# Test execution
test:
	npm test

test-smoke:
	npm run test:smoke

test-regression:
	npm run test:regression

test-dev:
	npm run test:dev

test-qa:
	npm run test:qa

test-prod:
	npm run test:prod

test-headed:
	npm run test:headed

test-debug:
	npm run test:debug

# Reporting
report:
	npm run report

# Code quality
lint:
	npm run lint

format:
	npm run format

type-check:
	npm run type-check

# Cleanup
clean:
	@echo "🧹 Cleaning generated files..."
	rm -rf reports/* screenshots/* videos/* logs/*
	@echo "✅ Cleanup complete!"
