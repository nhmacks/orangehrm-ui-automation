# OrangeHRM UI Automation Framework

Enterprise-level test automation framework for OrangeHRM using **Playwright** + **Cucumber** with TypeScript.

## 🚀 Features

- ✅ **BDD with Cucumber** - Write tests in Gherkin for business readability
- ✅ **Playwright** - Modern, fast, and reliable browser automation
- ✅ **TypeScript** - Type-safe test development
- ✅ **Page Object Model** - Maintainable and scalable architecture
- ✅ **Multi-browser support** - Chromium, Firefox, WebKit
- ✅ **Multi-environment** - Dev, QA, Production configurations
- ✅ **Parallel execution** - Run tests concurrently for faster feedback
- ✅ **Rich reporting** - HTML, JSON, JUnit reports
- ✅ **CI/CD ready** - GitHub Actions workflow included
- ✅ **Screenshot & video capture** - Automatic on failures
- ✅ **Detailed logging** - Winston logger with file output
- ✅ **Retry mechanism** - Auto-retry for flaky tests

## 📁 Project Structure

```
orangehrm-ui-automation/
├── .github/
│   ├── workflows/
│   │   └── test.yml              # CI/CD pipeline
│   └── copilot-instructions.md   # AI coding assistant guide
├── features/                      # Cucumber feature files
│   ├── login.feature
│   └── dashboard.feature
├── src/
│   ├── config/
│   │   └── ConfigManager.ts      # Environment configuration
│   ├── pages/                    # Page Object Models
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   └── DashboardPage.ts
│   ├── step-definitions/         # Cucumber step implementations
│   │   ├── login.steps.ts
│   │   └── dashboard.steps.ts
│   ├── support/                  # Test infrastructure
│   │   ├── BrowserManager.ts
│   │   ├── CustomWorld.ts
│   │   └── hooks.ts
│   ├── utils/                    # Utilities
│   │   ├── Logger.ts
│   │   └── reportGenerator.ts
│   └── fixtures/                 # Test data
│       └── testData.ts
├── reports/                      # Test reports (generated)
├── screenshots/                  # Screenshots (generated)
├── videos/                       # Videos (generated)
├── logs/                         # Log files (generated)
├── cucumber.json                 # Cucumber configuration
├── tsconfig.json                 # TypeScript configuration
├── .env.example                  # Environment variables template
└── package.json                  # Dependencies and scripts
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/nhmacks/orangehrm-ui-automation.git
cd orangehrm-ui-automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Create .env file from template
cp .env.example .env

# Edit .env with your configuration
```

## ⚙️ Configuration

Edit `.env` file to configure:

```bash
# Environment: dev | qa | prod
TEST_ENV=dev

# Browser: chromium | firefox | webkit
BROWSER=chromium

# Headless mode
HEADLESS=true

# Test credentials (environment-specific)
DEV_BASE_URL=https://opensource-demo.orangehrmlive.com
DEV_USERNAME=Admin
DEV_PASSWORD=admin123
```

## 🧪 Running Tests

### Run all tests
```bash
npm test
```

### Run specific environment
```bash
npm run test:dev      # Development environment
npm run test:qa       # QA environment
npm run test:prod     # Production environment
```

### Run by tags
```bash
npm run test:smoke        # Smoke tests only
npm run test:regression   # Regression tests
npm run test:tags "@login and @positive"  # Custom tags
```

### Run specific browser
```bash
BROWSER=firefox npm test
BROWSER=webkit npm test
```

### Run in headed mode (see browser)
```bash
npm run test:headed
```

### Debug mode
```bash
npm run test:debug
```

### Parallel execution
```bash
npm run test:parallel
```

## 📊 Reports

After test execution:

```bash
# Generate HTML report
npm run report

# View report
open reports/cucumber-report.html
```

Reports include:
- **HTML Report**: Beautiful, interactive test results
- **JSON Report**: Machine-readable format for integrations
- **JUnit XML**: For CI/CD tools
- **Summary**: Quick overview of test execution

## 🏗️ Writing Tests

### 1. Create Feature File

```gherkin
# features/my-feature.feature
@smoke @my-feature
Feature: My Feature
  As a user
  I want to test something
  So that I can verify it works

  Scenario: Test scenario
    Given I am on the login page
    When I login with valid credentials
    Then I should see the dashboard
```

### 2. Create Page Object

```typescript
// src/pages/MyPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  private readonly myElement: Locator;

  constructor(page: Page) {
    super(page);
    this.myElement = page.getByRole('button', { name: 'My Button' });
  }

  async clickMyButton(): Promise<void> {
    await this.click(this.myElement);
  }
}
```

### 3. Create Step Definitions

```typescript
// src/step-definitions/my-feature.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '@support/CustomWorld';
import { MyPage } from '@pages/MyPage';

Given('I am on my page', async function(this: ICustomWorld) {
  const myPage = new MyPage(this.page!);
  await myPage.goto();
});
```

## 🏷️ Tags

Use tags to organize and run specific tests:

- `@smoke` - Critical path tests
- `@regression` - Full regression suite
- `@login` - Login-related tests
- `@dashboard` - Dashboard tests
- `@positive` - Positive test cases
- `@negative` - Negative test cases
- `@skip` - Skip tests
- `@wip` - Work in progress
- `@dev-only` - Run only in dev environment
- `@prod-only` - Run only in production

## 🔧 CI/CD

GitHub Actions workflow is configured in `.github/workflows/test.yml`:

- Runs on push to main/develop
- Runs on pull requests
- Scheduled daily execution
- Manual trigger with environment selection
- Multi-browser matrix execution
- Automatic report generation and upload

## 📝 Best Practices

1. **Use Page Object Model** - Keep locators and actions in page objects
2. **Write readable Gherkin** - Use Given-When-Then pattern clearly
3. **Use semantic selectors** - Prefer role-based locators over CSS
4. **Keep steps reusable** - Write generic step definitions
5. **Tag appropriately** - Use tags for test organization
6. **Handle waits properly** - Use explicit waits, not hard timeouts
7. **Take screenshots on failure** - Automatically captured
8. **Log important actions** - Use logger for debugging
9. **Use environment config** - Don't hardcode URLs or credentials
10. **Run tests in parallel** - Maximize execution speed

## 🐛 Debugging

```bash
# Run in debug mode with Playwright Inspector
npm run test:debug

# Check logs
cat logs/combined.log
cat logs/error.log

# View traces (on failure)
npx playwright show-trace reports/traces/failed-scenario.zip

# Check screenshots
open screenshots/
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Write tests following BDD principles
3. Ensure all tests pass: `npm test`
4. Run linter: `npm run lint`
5. Format code: `npm run format`
6. Commit changes: `git commit -am 'Add my feature'`
7. Push branch: `git push origin feature/my-feature`
8. Create Pull Request

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [OrangeHRM Demo](https://opensource-demo.orangehrmlive.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📄 License

ISC

## 👥 Support

For issues or questions:
- Create an issue: [GitHub Issues](https://github.com/nhmacks/orangehrm-ui-automation/issues)
- Check documentation: `.github/copilot-instructions.md`

