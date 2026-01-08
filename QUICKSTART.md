# Quick Start Guide

## Initial Setup

```bash
# 1. Install dependencies and setup project
npm install
npx playwright install

# 2. Create environment configuration
cp .env.example .env

# 3. Edit .env with your settings (optional - defaults work for demo)
# DEV_BASE_URL, DEV_USERNAME, DEV_PASSWORD, etc.
```

## Running Tests

### Basic Commands
```bash
npm test                    # Run all tests with default settings
npm run test:smoke         # Run only smoke tests (@smoke tag)
npm run test:regression    # Run full regression suite
```

### By Environment
```bash
npm run test:dev           # Development environment
npm run test:qa            # QA environment
npm run test:prod          # Production environment
```

### By Tags
```bash
npm run test:tags "@login"                    # Only login tests
npm run test:tags "@smoke and @positive"      # Smoke AND positive tests
npm run test:tags "@regression and not @skip" # Regression excluding skipped
```

### Debug & Development
```bash
npm run test:headed        # Run with visible browser
npm run test:debug         # Run with Playwright Inspector
BROWSER=firefox npm test   # Run with specific browser
```

## View Reports

```bash
npm run report             # Generate HTML report
open reports/cucumber-report.html  # View in browser
```

## Common Workflows

### Write New Test
1. Create feature: `features/my-feature.feature`
2. Run test (will suggest missing steps)
3. Implement steps: `src/step-definitions/my-feature.steps.ts`
4. Create page object if needed: `src/pages/MyPage.ts`

### Debug Failing Test
1. Check logs: `cat logs/combined.log`
2. View screenshots: `open screenshots/`
3. View trace: `npx playwright show-trace reports/traces/failed-*.zip`
4. Run in debug mode: `npm run test:debug`

### CI/CD
Tests run automatically on:
- Push to main/develop
- Pull requests
- Daily schedule (2 AM UTC)
- Manual trigger (GitHub Actions)

## Useful Aliases

Add to your shell profile (~/.bashrc, ~/.zshrc):

```bash
alias ot='npm test'
alias ots='npm run test:smoke'
alias otr='npm run test:regression'
alias otd='npm run test:debug'
alias oth='npm run test:headed'
alias otl='cat logs/combined.log'
```

## Troubleshooting

### Tests not running
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npx playwright install
```

### TypeScript errors
```bash
npm run type-check          # Check for errors
npm run lint               # Check linting
npm run format             # Auto-format code
```

### Clean slate
```bash
npm run clean              # Remove all generated files
git clean -fdx             # Nuclear option (removes everything not in git)
npm install                # Reinstall
```

## File Locations

- **Tests**: `features/*.feature`
- **Step Definitions**: `src/step-definitions/*.steps.ts`
- **Page Objects**: `src/pages/*Page.ts`
- **Reports**: `reports/cucumber-report.html`
- **Screenshots**: `screenshots/`
- **Logs**: `logs/combined.log`
- **Config**: `.env` (your settings)

## Getting Help

- Read: `README.md`
- AI Guide: `.github/copilot-instructions.md`
- Issues: https://github.com/nhmacks/orangehrm-ui-automation/issues
- Playwright Docs: https://playwright.dev
- Cucumber Docs: https://cucumber.io/docs/cucumber/
