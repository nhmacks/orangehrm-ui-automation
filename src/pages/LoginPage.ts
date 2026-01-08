import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '@utils/Logger';

export class LoginPage extends BasePage {
  // Locators
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly loginPanel: Locator;
  private readonly logoImage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators using role-based and semantic selectors
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('.oxd-alert-content-text, .oxd-alert, [class*="error"], [role="alert"]').first();
    this.forgotPasswordLink = page.locator('p.oxd-text--p, a').filter({ hasText: /forgot.*password/i }).first();
    this.loginPanel = page.locator('.oxd-sheet, .orangehrm-login-container, [class*="login-panel"]').first();
    this.logoImage = page.locator('img[alt*="company-branding"], img[alt*="logo"], .orangehrm-login-logo img').first();
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    logger.info('Navigating to login page');
    await this.navigateTo(this.config.baseUrl);
    await this.waitForPageLoad();
    
    // Wait for login form to be visible
    await this.waitForElement(this.usernameInput, 10000);
  }

  /**
   * Enter username only
   */
  async enterUsername(username: string): Promise<void> {
    logger.info(`Entering username: ${username}`);
    await this.fill(this.usernameInput, username);
  }

  /**
   * Enter password only
   */
  async enterPassword(password: string): Promise<void> {
    logger.info('Entering password');
    await this.fill(this.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    logger.info('Clicking login button');
    await this.click(this.loginButton);
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      logger.warn('Network did not become idle within timeout after login');
    });
    logger.info('Login button clicked and navigation completed');
  }

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    logger.info(`Attempting login with username: ${username}`);
    
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
    
    logger.info('Login action completed');
  }

  /**
   * Quick login with default credentials from config
   */
  async quickLogin(): Promise<void> {
    logger.info('Performing quick login with default credentials');
    await this.login(this.config.username, this.config.password);
  }

  /**
   * Get error message after failed login
   */
  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return await this.getText(this.errorMessage);
  }

  /**
   * Check if error message is displayed
   */
  async isErrorDisplayed(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordLink);
    logger.info('Clicked forgot password link');
  }

  /**
   * Check if login page is displayed
   */
  async isLoginPageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.loginPanel);
  }

  /**
   * Wait for login page to load and verify URL
   */
  async waitForLoginPageLoad(timeout: number = 10000): Promise<void> {
    logger.info('Waiting for login page to load');
    await this.page.waitForURL(/.*login|.*auth/, { timeout });
    await this.waitForElement(this.loginPanel, 5000).catch(() => {
      logger.warn('Login panel not found within timeout');
    });
    logger.info('Login page loaded successfully');
  }

  /**
   * Verify user is on login page
   */
  async isOnLoginPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('login') || url.includes('auth');
  }

  /**
   * Check if username input is visible
   */
  async isUsernameInputVisible(): Promise<boolean> {
    return await this.isVisible(this.usernameInput);
  }

  /**
   * Check if password input is visible
   */
  async isPasswordInputVisible(): Promise<boolean> {
    return await this.isVisible(this.passwordInput);
  }

  /**
   * Check if login button is visible
   */
  async isLoginButtonVisible(): Promise<boolean> {
    return await this.isVisible(this.loginButton);
  }

  /**
   * Check if forgot password link is visible
   */
  async isForgotPasswordLinkVisible(): Promise<boolean> {
    return await this.isVisible(this.forgotPasswordLink);
  }

  /**
   * Check if logo is visible
   */
  async isLogoVisible(): Promise<boolean> {
    return await this.isVisible(this.logoImage);
  }

  /**
   * Get password field type attribute
   */
  async getPasswordFieldType(): Promise<string | null> {
    return await this.passwordInput.getAttribute('type');
  }

  /**
   * Get validation errors count
   */
  async getValidationErrorsCount(): Promise<number> {
    const errors = this.page.locator('.oxd-input-field-error-message');
    return await errors.count();
  }

  /**
   * Clear login form
   */
  async clearForm(): Promise<void> {
    await this.fill(this.usernameInput, '', { clear: true });
    await this.fill(this.passwordInput, '', { clear: true });
    logger.info('Login form cleared');
  }

  /**
   * Get username field placeholder
   */
  async getUsernamePlaceholder(): Promise<string | null> {
    return await this.getAttribute(this.usernameInput, 'placeholder');
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isEnabled(this.loginButton);
  }

  /**
   * Verify logo is displayed
   */
  async isLogoDisplayed(): Promise<boolean> {
    return await this.isVisible(this.logoImage);
  }
}
