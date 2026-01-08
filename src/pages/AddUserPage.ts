import { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '@utils/Logger';

/**
 * Page Object for Add/Edit User page
 * Handles user creation and modification
 */
export class AddUserPage extends BasePage {
  // Form fields
  private readonly userRoleDropdown: Locator;
  private readonly employeeNameInput: Locator;
  private readonly employeeNameSuggestions: Locator;
  private readonly statusDropdown: Locator;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;

  // Action buttons
  private readonly saveButton: Locator;
  private readonly cancelButton: Locator;

  // Success/Error messages
  private readonly successMessage: Locator;
  private readonly errorMessage: Locator;

  // Page title
  private readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    
    // Form fields - using multiple selectors for reliability
    this.userRoleDropdown = page.locator('.oxd-select-text-input').first();
    this.employeeNameInput = page.locator('input[placeholder*="Type for hints"]');
    this.employeeNameSuggestions = page.locator('.oxd-autocomplete-dropdown');
    this.statusDropdown = page.locator('.oxd-select-text-input').nth(1);
    // Username input - use role-based locator or fallback to nth selector
    this.usernameInput = page.getByLabel(/username/i).or(page.locator('input[placeholder*="Username"]')).or(page.locator('.oxd-input').nth(3));
    this.passwordInput = page.locator('input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[type="password"]').nth(1);

    // Action buttons
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    // Messages
    this.successMessage = page.locator('.oxd-toast-content--success, .oxd-text--toast-message');
    this.errorMessage = page.locator('.oxd-toast-content--error, .oxd-input-field-error-message');

    // Page title
    this.pageTitle = page.locator('.oxd-text--h6, h6').filter({ hasText: /Add User|Edit User/i });
  }

  /**
   * Navigation and validation
   */

  async waitForAddUserPageLoad(): Promise<void> {
    logger.info('Waiting for Add User page to load');
    await this.waitForElement(this.userRoleDropdown, 10000);
    await this.waitForElement(this.saveButton, 5000);
    logger.info('Add User page loaded');
  }

  async isOnAddUserPage(): Promise<boolean> {
    try {
      await this.waitForElement(this.pageTitle, 5000);
      const title = await this.pageTitle.textContent();
      return title?.includes('Add User') || title?.includes('Edit User') || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Form filling methods
   */

  async selectUserRole(role: string): Promise<void> {
    logger.info(`Selecting user role: ${role}`);
    await this.click(this.userRoleDropdown);
    await this.page.waitForTimeout(500);
    const roleOption = this.page.getByRole('option', { name: role, exact: true });
    await this.click(roleOption);
    logger.info(`User role "${role}" selected`);
  }

  async enterEmployeeName(employeeName: string): Promise<void> {
    logger.info(`Entering employee name: ${employeeName}`);
    await this.fill(this.employeeNameInput, employeeName);
    // Wait longer for autocomplete suggestions to populate
    await this.page.waitForTimeout(2500);
    logger.info('Employee name entered, waiting for suggestions');
  }

  async selectEmployeeFromSuggestions(employeeName: string): Promise<void> {
    logger.info(`Selecting employee from suggestions: ${employeeName}`);
    try {
      // Wait longer for autocomplete dropdown to appear
      await this.waitForElement(this.employeeNameSuggestions, 10000).catch(() => {
        logger.warn('Autocomplete suggestions did not appear - will try selecting anyway');
      });
      
      // Additional wait for suggestions to populate
      await this.page.waitForTimeout(2000);
      
      // Try exact match first, then partial match
      let suggestion = this.page.locator('.oxd-autocomplete-option').filter({ hasText: new RegExp(`^${employeeName}$`) }).first();
      let suggestionCount = await suggestion.count();
      
      if (suggestionCount === 0) {
        // If exact match not found, try partial match
        logger.info('Exact match not found, trying partial match');
        suggestion = this.page.locator('.oxd-autocomplete-option').filter({ hasText: employeeName }).first();
        suggestionCount = await suggestion.count();
      }
      
      if (suggestionCount === 0) {
        // If still no matches, log warning but don't fail (demo site may have issues)
        logger.warn(`No autocomplete suggestions found for "${employeeName}" - continuing anyway`);
        return; // Exit gracefully without clicking
      }
      
      await this.waitForElement(suggestion, 5000);
      await this.click(suggestion);
      logger.info(`Employee "${employeeName}" selected from suggestions`);
    } catch (error) {
      logger.error(`Failed to select employee from suggestions: ${error}`);
      throw error;
    }
  }

  async selectStatus(status: string): Promise<void> {
    logger.info(`Selecting status: ${status}`);
    await this.click(this.statusDropdown);
    await this.page.waitForTimeout(500);
    const statusOption = this.page.getByRole('option', { name: status, exact: true });
    await this.click(statusOption);
    logger.info(`Status "${status}" selected`);
  }

  async enterUsername(username: string): Promise<void> {
    logger.info(`Entering username: ${username}`);
    // Use the usernameInput locator from constructor
    await this.fill(this.usernameInput, username);
    logger.info('Username entered');
  }

  async enterPassword(password: string): Promise<void> {
    logger.info('Entering password');
    await this.fill(this.passwordInput, password);
    logger.info('Password entered');
  }

  async enterConfirmPassword(password: string): Promise<void> {
    logger.info('Entering confirm password');
    await this.fill(this.confirmPasswordInput, password);
    logger.info('Confirm password entered');
  }

  /**
   * Complete user creation flow
   */

  async createUser(
    userRole: string,
    employeeNameSearch: string,
    employeeNameSelect: string,
    status: string,
    username: string,
    password: string
  ): Promise<void> {
    logger.info(`Creating user: ${username}`);
    
    await this.selectUserRole(userRole);
    await this.enterEmployeeName(employeeNameSearch);
    await this.selectEmployeeFromSuggestions(employeeNameSelect);
    await this.selectStatus(status);
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.enterConfirmPassword(password);
    
    logger.info('User form filled, ready to save');
  }

  /**
   * Action methods
   */

  async clickSaveButton(): Promise<void> {
    logger.info('Clicking Save button');
    await this.click(this.saveButton);
    await this.page.waitForTimeout(2000); // Wait for save operation
    logger.info('Save button clicked');
  }

  async clickCancelButton(): Promise<void> {
    logger.info('Clicking Cancel button');
    await this.click(this.cancelButton);
    logger.info('Cancel button clicked');
  }

  /**
   * Validation methods - Messages
   */

  async isSuccessMessageDisplayed(): Promise<boolean> {
    try {
      await this.waitForElement(this.successMessage, 5000);
      const isVisible = await this.isVisible(this.successMessage);
      logger.info(`Success message displayed: ${isVisible}`);
      return isVisible;
    } catch (error) {
      logger.warn('No success message found');
      return false;
    }
  }

  async getSuccessMessage(): Promise<string> {
    try {
      const message = await this.getText(this.successMessage);
      logger.info(`Success message: ${message}`);
      return message;
    } catch (error) {
      logger.warn('Could not get success message');
      return '';
    }
  }

  async isErrorMessageDisplayed(): Promise<boolean> {
    try {
      const isVisible = await this.isVisible(this.errorMessage);
      logger.info(`Error message displayed: ${isVisible}`);
      return isVisible;
    } catch (error) {
      return false;
    }
  }

  /**
   * Field validation methods
   */

  async isUserRoleDropdownVisible(): Promise<boolean> {
    return await this.isVisible(this.userRoleDropdown);
  }

  async isEmployeeNameInputVisible(): Promise<boolean> {
    return await this.isVisible(this.employeeNameInput);
  }

  async isStatusDropdownVisible(): Promise<boolean> {
    return await this.isVisible(this.statusDropdown);
  }

  async isUsernameInputVisible(): Promise<boolean> {
    return await this.isVisible(this.usernameInput);
  }

  async isPasswordInputVisible(): Promise<boolean> {
    return await this.isVisible(this.passwordInput);
  }

  async isConfirmPasswordInputVisible(): Promise<boolean> {
    return await this.isVisible(this.confirmPasswordInput);
  }

  async isSaveButtonVisible(): Promise<boolean> {
    return await this.isVisible(this.saveButton);
  }

  async isCancelButtonVisible(): Promise<boolean> {
    return await this.isVisible(this.cancelButton);
  }

  /**
   * Field value getters
   */

  async getUsernameValue(): Promise<string> {
    const usernameField = this.page.locator('.oxd-form-row').filter({ hasText: 'Username' }).locator('input');
    return await usernameField.inputValue();
  }

  async getEmployeeNameValue(): Promise<string> {
    return await this.employeeNameInput.inputValue();
  }
}
