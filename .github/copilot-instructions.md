# OrangeHRM UI Automation - Copilot Instructions

Enterprise-level test automation framework using **Playwright + Cucumber + TypeScript** for OrangeHRM web application.

## 🏗️ Architecture Overview

**Framework Type**: BDD (Behavior-Driven Development) with Page Object Model (POM)
**Stack**: Playwright v1.57+ | Cucumber v11+ | TypeScript 5+
**Pattern**: Custom World with Browser Manager for isolated test contexts

### Key Components

```
src/
├── config/ConfigManager.ts      # Multi-environment configuration (dev/qa/prod)
├── support/
│   ├── CustomWorld.ts           # Cucumber World with Playwright integration
│   ├── BrowserManager.ts        # Singleton browser lifecycle management
│   └── hooks.ts                 # Before/After hooks, screenshots, traces
├── pages/
│   ├── BasePage.ts              # Reusable page actions (click, fill, wait)
│   └── [Feature]Page.ts         # POM per module (LoginPage, DashboardPage)
├── step-definitions/
│   └── [feature].steps.ts       # Cucumber step implementations
├── utils/
│   ├── Logger.ts                # Winston logger (console + file)
│   └── reportGenerator.ts       # HTML report generation post-execution
└── fixtures/testData.ts         # Test data constants
```

## 🚀 Critical Commands

**Run Tests**:
```bash
npm test                         # All tests (default profile)
npm run test:dev                 # Dev environment
npm run test:qa                  # QA environment
npm run test:smoke               # @smoke tagged tests
npm run test:tags "@login and @positive"  # Custom tag combinations
npm run test:parallel            # Parallel execution (3 workers)
npm run test:headed              # Visible browser
npm run test:debug               # Playwright Inspector
```

**Reports & Utils**:
```bash
npm run report                   # Generate HTML report from JSON
npm run clean                    # Remove reports/screenshots/videos
npm run lint                     # ESLint check
npm run format                   # Prettier formatting
```

**No Playwright CLI** - Use Cucumber CLI via npm scripts. Playwright is the engine, Cucumber is the runner.

## 📝 Writing Tests - Strict Conventions

### 1. Feature Files (`features/*.feature`)

**Location**: Root-level `features/` directory
**Naming**: `[module].feature` (e.g., `login.feature`, `pim.feature`)
**Tags**: Use multiple tags for filtering

```gherkin
@smoke @login @regression
Feature: User Authentication
  As a user
  I want to login to OrangeHRM
  So that I can access my account

  Background:
    Given I am on the OrangeHRM login page

  @positive
  Scenario: Successful login
    When I enter username "Admin"
    And I enter password "admin123"
    And I click the login button
    Then I should be redirected to the dashboard

  @data-driven
  Scenario Outline: Multiple credentials
    When I login with "<username>" and "<password>"
    Then I should see "<result>"

    Examples:
      | username | password | result              |
      | Admin    | admin123 | Dashboard           |
      | invalid  | wrong    | Invalid credentials |
```

**Tag Strategy**:
- `@smoke` - Critical path tests (run in CI on every PR)
- `@regression` - Full suite
- `@[module]` - By feature (login, pim, leave)
- `@positive/@negative` - Test type
- `@skip/@wip` - Temporary exclusions
- `@dev-only/@prod-only` - Environment-specific

### 2. Page Objects (`src/pages/`)

**Must extend `BasePage`** - Inherit 20+ reusable methods (click, fill, waitForElement, etc.)
**Use Playwright locators** - Role-based > Test IDs > CSS

```typescript
// src/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Declare locators as private readonly
  private readonly usernameInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    // Initialize in constructor using semantic selectors
    this.usernameInput = page.getByPlaceholder('Username');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  // Methods return Promise<void> or Promise<data>
  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username);  // BasePage method
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
    await this.waitForPageLoad();  // BasePage method
  }

  // Use config for default values
  async quickLogin(): Promise<void> {
    await this.login(this.config.username, this.config.password);
  }
}
```

**BasePage Methods** (available in all pages):
- `click(locator, options?)` - Smart click with auto-wait
- `fill(locator, text, options?)` - Fill with clear option
- `getText(locator)` - Extract text content
- `waitForElement(locator, timeout?)` - Explicit wait
- `isVisible(locator)` - Boolean check
- `takeScreenshot(name)` - Manual screenshot
- `waitForPageLoad()` - Network idle wait

### 3. Step Definitions (`src/step-definitions/`)

**One file per feature** - `[feature].steps.ts`
**Type `this` as `ICustomWorld`** - Access `page`, `browser`, `context`
**Import page objects** - Don't duplicate selectors

```typescript
// src/step-definitions/login.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '@support/CustomWorld';
import { LoginPage } from '@pages/LoginPage';
import { logger } from '@utils/Logger';

let loginPage: LoginPage;

Given('I am on the OrangeHRM login page', async function(this: ICustomWorld) {
  loginPage = new LoginPage(this.page!);
  await loginPage.goto();
  logger.info('Navigated to login page');
});

When('I enter username {string}', async function(this: ICustomWorld, username: string) {
  // Access page via this.page! (non-null assertion)
  await this.page!.getByPlaceholder('Username').fill(username);
});

Then('I should be redirected to the dashboard', async function(this: ICustomWorld) {
  await this.page!.waitForURL(/.*dashboard/, { timeout: 10000 });
  expect(this.page!.url()).toContain('dashboard');
});
```

**Step Patterns**:
- Use cucumber expressions: `{string}`, `{int}`, `{float}`
- Reuse steps across features (keep generic)
- Log important actions for debugging
- Use `expect` from `@playwright/test` (not Chai)

### 4. Configuration (`src/config/ConfigManager.ts`)

**Singleton pattern** - Access via `ConfigManager.getInstance()` or direct import
**Environment switching** - Set `TEST_ENV=dev|qa|prod` in `.env`

```typescript
import ConfigManager from '@config/ConfigManager';

const envConfig = ConfigManager.getEnvironmentConfig();
// { baseUrl, username, password, apiBaseUrl }

const browserConfig = ConfigManager.getBrowserConfig();
// { browser, headless, timeout, screenshot, trace, video }

const testConfig = ConfigManager.getTestConfig();
// { workers, retryCount, reportPath, logLevel }
```

**Add new environment**:
1. Add to `.env`: `STAGING_BASE_URL=https://staging.example.com`
2. ConfigManager auto-loads via `${env}_BASE_URL` pattern

### 5. Hooks (`src/support/hooks.ts`)

**Auto-executed** - Don't call manually
**Current hooks**:
- `BeforeAll` - Create directories, log config
- `Before` - Initialize browser/context/page per scenario
- `AfterStep` - Log step status, screenshot on failure
- `After` - Cleanup browser, save trace on failure
- `Before({ tags: '@smoke' })` - Tag-specific setup

**Add custom hook**:
```typescript
Before({ tags: '@api-auth' }, async function(this: ICustomWorld) {
  // Pre-authenticate via API, save cookies
  await this.context!.addCookies([...]);
});
```

## 🔧 Configuration Files

### `cucumber.json` - Cucumber Profiles

**Profiles**: `default`, `dev`, `qa`, `prod`, `ci`
**Key settings**:
- `parallel: 2` - Number of workers
- `retry: 1` - Retry failed scenarios
- `format` - Reporters (progress-bar, html, json, junit)

**Run profile**: `npm run test:qa` → uses `qa` profile

### `.env` - Environment Variables

**Critical vars**:
- `TEST_ENV=dev` - Active environment
- `BROWSER=chromium` - Browser choice
- `HEADLESS=true` - Headless mode
- `[ENV]_BASE_URL` - Environment URLs
- `[ENV]_USERNAME/PASSWORD` - Credentials

**Never commit `.env`** - Use `.env.example` template

### `tsconfig.json` - Path Aliases

**Enabled aliases**:
```typescript
import { LoginPage } from '@pages/LoginPage';       // vs ../../pages/LoginPage
import ConfigManager from '@config/ConfigManager';  // vs ../../config/ConfigManager
import { logger } from '@utils/Logger';
```

**Available aliases**: `@pages`, `@support`, `@config`, `@utils`, `@fixtures`, `@step-definitions`

## 🎯 Execution Context

### Browser Lifecycle

**Per scenario** (not shared):
1. `Before` hook → `BrowserManager.initBrowser()`
2. Create context with video/trace settings
3. Create page
4. Execute steps
5. `After` hook → Close page/context/browser

**Access in steps**:
```typescript
this.page!      // Current page
this.context!   // Browser context
this.browser!   // Browser instance
```

### Parallel Execution

**Configured in `cucumber.json`**:
- Dev: 1 worker (sequential)
- QA: 3 workers
- Prod: 5 workers

**Important**: Each worker gets isolated browser instance (no state sharing)

## 📊 Reporting

### Automatic Reports

**After every run**:
1. `cucumber-report.json` - Raw data
2. `cucumber-report.html` - Visual report (via `cucumber-html-reporter`)
3. `cucumber-report.xml` - JUnit format (for CI)
4. `summary.json` - Test metrics

**Generate manually**: `npm run report`

### Screenshots & Videos

**Automatic on failure** (configured in `ConfigManager`):
- Screenshots: `screenshots/failed-[scenario]-[timestamp].png`
- Videos: `videos/[scenario].webm` (if `VIDEO=on` in `.env`)
- Traces: `reports/traces/failed-[scenario].zip` (view with `npx playwright show-trace`)

**Manual screenshot in step**:
```typescript
await this.attachScreenshot('custom-name');  // Attaches to Cucumber report
```

## 🏷️ Tagging Strategy

**Run by tags**:
```bash
npm run test:tags "@smoke and not @skip"
npm run test:tags "@login or @dashboard"
npm run test:tags "@regression and @positive"
```

**Skip tests**:
```gherkin
@skip
Scenario: Not ready yet
```

**Environment-specific** (auto-skipped in hooks):
```gherkin
@dev-only
Scenario: Test only in dev
```

## 🐛 Debugging

**Use Playwright Inspector**:
```bash
PWDEBUG=1 npm test              # Opens inspector
npm run test:debug              # Alias
```

**Check logs**:
- `logs/combined.log` - All logs
- `logs/error.log` - Errors only

**View traces** (on failure):
```bash
npx playwright show-trace reports/traces/failed-login-scenario.zip
```

## 🚨 Common Pitfalls

1. **Don't use Playwright test runner** - This is Cucumber-driven, not `npx playwright test`
2. **Always type `this` in steps** - `async function(this: ICustomWorld)`
3. **Don't share page objects between scenarios** - Instantiate in steps
4. **Use `this.page!` not global page** - Each scenario gets isolated page
5. **Don't hardcode URLs** - Use `ConfigManager.getEnvironmentConfig().baseUrl`
6. **Install dependencies after clone** - `npm ci` then `npx playwright install`

## 📦 Adding New Test

**Workflow**:
1. Create `features/my-feature.feature`
2. Run tests → Cucumber suggests missing steps
3. Create `src/step-definitions/my-feature.steps.ts`
4. Implement steps using page objects
5. Create page object if needed (`src/pages/MyFeaturePage.ts`)
6. Tag appropriately (`@smoke`, `@regression`, etc.)
7. Run: `npm run test:tags "@my-feature"`

## 🔗 CI/CD Integration

**GitHub Actions** (`.github/workflows/test.yml`):
- Runs on push/PR to main/develop
- Matrix strategy: chromium, firefox, webkit
- Uploads HTML reports as artifacts
- Comments PR with test summary
- Scheduled daily execution

**Trigger manually**:
- Go to Actions → Cucumber Test Execution → Run workflow
- Select environment and tags

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `cucumber.json` | Cucumber profiles and formatters |
| `tsconfig.json` | TypeScript config with path aliases |
| `.env` | Environment variables (not committed) |
| `package.json` | Scripts and dependencies |
| `src/support/CustomWorld.ts` | Cucumber World with browser context |
| `src/support/hooks.ts` | Lifecycle hooks |
| `src/pages/BasePage.ts` | Reusable page actions |
| `src/config/ConfigManager.ts` | Multi-environment config |

## 🎓 Best Practices

1. **Use role-based locators**: `getByRole('button', { name: 'Login' })`
2. **Extend BasePage**: Don't rewrite common actions
3. **Log important steps**: `logger.info('Action performed')`
4. **Use explicit waits**: `waitForElement()` not `page.waitForTimeout()`
5. **Tag tests**: Enable selective execution
6. **Keep Gherkin readable**: Non-technical stakeholders should understand
7. **Reuse step definitions**: Write generic, parameterized steps
8. **Handle flaky tests**: Add `@flaky` tag for auto-retry
9. **Use fixtures**: `src/fixtures/testData.ts` for constants
10. **Review reports**: Check HTML report after failures

