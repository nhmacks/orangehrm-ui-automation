import { Page, Locator } from '@playwright/test';
import { logger } from '@utils/Logger';
import ConfigManager from '@config/ConfigManager';

export abstract class BasePage {
  protected page: Page;
  protected config = ConfigManager.getEnvironmentConfig();
  protected browserConfig = ConfigManager.getBrowserConfig();

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async navigateTo(url: string): Promise<void> {
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: this.browserConfig.navigationTimeout,
    });
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: 'visible',
      timeout: timeout || this.browserConfig.actionTimeout,
    });
  }

  /**
   * Click on element with retry logic
   */
  async click(locator: Locator, options?: { force?: boolean; timeout?: number }): Promise<void> {
    try {
      await this.waitForElement(locator, options?.timeout);
      await locator.click({ force: options?.force, timeout: options?.timeout });
      logger.info(`Clicked on element: ${locator}`);
    } catch (error) {
      logger.error(`Failed to click on element: ${locator}`, { error });
      throw error;
    }
  }

  /**
   * Fill input field
   */
  async fill(locator: Locator, text: string, options?: { clear?: boolean; timeout?: number }): Promise<void> {
    try {
      await this.waitForElement(locator, options?.timeout);
      
      if (options?.clear) {
        await locator.clear();
      }
      
      await locator.fill(text, { timeout: options?.timeout });
      logger.info(`Filled element with text: "${text}"`);
    } catch (error) {
      logger.error(`Failed to fill element: ${locator}`, { error });
      throw error;
    }
  }

  /**
   * Type text slowly (for special cases)
   */
  async type(locator: Locator, text: string, delay: number = 100): Promise<void> {
    try {
      await this.waitForElement(locator);
      await locator.type(text, { delay });
      logger.info(`Typed text: "${text}" with delay: ${delay}ms`);
    } catch (error) {
      logger.error(`Failed to type text: ${locator}`, { error });
      throw error;
    }
  }

  /**
   * Select option from dropdown
   */
  async selectOption(locator: Locator, value: string | { label: string } | { value: string } | { index: number }): Promise<void> {
    try {
      await this.waitForElement(locator);
      await locator.selectOption(value as any);
      logger.info(`Selected option: ${JSON.stringify(value)}`);
    } catch (error) {
      logger.error(`Failed to select option: ${locator}`, { error });
      throw error;
    }
  }

  /**
   * Get text from element
   */
  async getText(locator: Locator): Promise<string> {
    try {
      await this.waitForElement(locator);
      const text = await locator.textContent() || '';
      logger.info(`Retrieved text: "${text}"`);
      return text.trim();
    } catch (error) {
      logger.error(`Failed to get text from element: ${locator}`, { error });
      throw error;
    }
  }

  /**
   * Get attribute value
   */
  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    try {
      await this.waitForElement(locator);
      const value = await locator.getAttribute(attribute);
      logger.info(`Retrieved attribute "${attribute}": "${value}"`);
      return value;
    } catch (error) {
      logger.error(`Failed to get attribute from element: ${locator}`, { error });
      throw error;
    }
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    try {
      return await locator.isEnabled();
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for page load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      logger.warn('Network did not become idle within timeout');
    });
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    const screenshotPath = ConfigManager.getTestConfig().screenshotPath;
    const screenshot = await this.page.screenshot({
      path: `${screenshotPath}/${name}-${Date.now()}.png`,
      fullPage: true,
    });
    logger.info(`Screenshot taken: ${name}`);
    return screenshot;
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
    logger.info('Scrolled to element');
  }

  /**
   * Wait for specific time
   */
  async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Refresh page
   */
  async refresh(): Promise<void> {
    await this.page.reload();
    logger.info('Page refreshed');
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
    logger.info(`Pressed key: ${key}`);
  }

  /**
   * Handle alert/dialog
   */
  async handleDialog(accept: boolean = true, promptText?: string): Promise<void> {
    this.page.once('dialog', async dialog => {
      logger.info(`Dialog appeared: ${dialog.message()}`);
      if (accept) {
        await dialog.accept(promptText);
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Switch to iframe
   */
  async switchToFrame(frameLocator: string): Promise<any> {
    const frame = this.page.frameLocator(frameLocator);
    logger.info(`Switched to iframe: ${frameLocator}`);
    return frame;
  }

  /**
   * Wait for API response
   */
  async waitForResponse(urlPattern: string | RegExp, timeout?: number): Promise<any> {
    const response = await this.page.waitForResponse(urlPattern, {
      timeout: timeout || this.browserConfig.actionTimeout,
    });
    logger.info(`Received response from: ${urlPattern}`);
    return response;
  }

  /**
   * Execute JavaScript
   */
  async executeScript<T>(script: string, ...args: any[]): Promise<T> {
    const result = await this.page.evaluate(script, ...args);
    logger.info('Executed JavaScript');
    return result as T;
  }

  /**
   * Get attribute from element
   */
  async getAttribute(locator: Locator, attributeName: string): Promise<string | null> {
    try {
      return await locator.getAttribute(attributeName);
    } catch (error) {
      logger.error(`Failed to get attribute ${attributeName}`, { error });
      return null;
    }
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    try {
      return await locator.isEnabled();
    } catch (error) {
      logger.error('Failed to check if element is enabled', { error });
      return false;
    }
  }
}
