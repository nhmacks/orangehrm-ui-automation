import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '@utils/Logger';

/**
 * Page Object for User Management / System Users page
 * Handles user filtering, search, and user list operations
 */
export class UserManagementPage extends BasePage {
  // Navigation
  private readonly adminMenuItem: Locator;
  private readonly systemUsersMenuItem: Locator;

  // Filter fields
  private readonly usernameFilterInput: Locator;
  private readonly userRoleDropdown: Locator;
  private readonly employeeNameInput: Locator;
  private readonly statusDropdown: Locator;

  // Action buttons
  private readonly searchButton: Locator;
  private readonly resetButton: Locator;
  private readonly addButton: Locator;

  // Results table
  private readonly resultsTable: Locator;
  private readonly tableRows: Locator;
  private readonly noRecordsMessage: Locator;
  private readonly recordsFoundText: Locator;

  // Table columns
  private readonly usernameColumn: Locator;
  private readonly userRoleColumn: Locator;
  private readonly employeeNameColumn: Locator;
  private readonly statusColumn: Locator;

  constructor(page: Page) {
    super(page);
    
    // Navigation
    this.adminMenuItem = page.getByRole('link', { name: 'Admin' });
    this.systemUsersMenuItem = page.getByRole('menuitem', { name: 'System Users' });

    // Filter fields - using multiple selectors for reliability
    this.usernameFilterInput = page.locator('input[name="username"], .oxd-input[placeholder*="Username"], .oxd-grid-item input').first();
    this.userRoleDropdown = page.locator('.oxd-select-text-input').first();
    this.employeeNameInput = page.locator('input[placeholder*="Type for hints"], input[placeholder*="Employee Name"]');
    this.statusDropdown = page.locator('.oxd-select-text-input').nth(1);

    // Action buttons
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.addButton = page.getByRole('button', { name: 'Add' });

    // Results table
    this.resultsTable = page.locator('.oxd-table, [role="table"]');
    this.tableRows = page.locator('.oxd-table-body .oxd-table-card, .oxd-table-row').filter({ hasNotText: 'Username' });
    this.noRecordsMessage = page.locator('.oxd-toast-content--info, .oxd-table-body:has-text("No Records Found")');
    this.recordsFoundText = page.locator('.oxd-text--span:has-text("Records Found")');

    // Table columns (using nth-child for specific columns)
    this.usernameColumn = page.locator('.oxd-table-cell:nth-child(2)');
    this.userRoleColumn = page.locator('.oxd-table-cell:nth-child(3)');
    this.employeeNameColumn = page.locator('.oxd-table-cell:nth-child(4)');
    this.statusColumn = page.locator('.oxd-table-cell:nth-child(5)');
  }

  /**
   * Navigation Methods
   */

  async navigateToAdmin(): Promise<void> {
    logger.info('Navigating to Admin module');
    await this.click(this.adminMenuItem);
    await this.waitForPageLoad();
    logger.info('Navigated to Admin module');
  }

  async navigateToSystemUsers(): Promise<void> {
    logger.info('Navigating to System Users page');
    await this.page.waitForURL(/.*admin.*/, { timeout: 10000 });
    await this.waitForElement(this.usernameFilterInput, 10000);
    logger.info('System Users page loaded');
  }

  async waitForSystemUsersPageLoad(): Promise<void> {
    await this.page.waitForURL(/.*admin.*/, { timeout: 10000 });
    await this.waitForElement(this.searchButton, 5000);
    await this.waitForElement(this.usernameFilterInput, 5000);
  }

  async isOnSystemUsersPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('admin') && url.includes('viewSystemUsers');
  }

  /**
   * Filter Methods
   */

  async enterUsernameFilter(username: string): Promise<void> {
    logger.info(`Entering username filter: ${username}`);
    await this.fill(this.usernameFilterInput, username);
    logger.info('Username filter entered');
  }

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
    await this.page.waitForTimeout(1000); // Wait for autocomplete suggestions
    logger.info('Employee name entered');
  }

  async selectEmployeeFromDropdown(employeeName: string): Promise<void> {
    logger.info(`Selecting employee from dropdown: ${employeeName}`);
    const suggestion = this.page.locator('.oxd-autocomplete-option').filter({ hasText: employeeName }).first();
    await this.waitForElement(suggestion, 5000);
    await this.click(suggestion);
    logger.info(`Employee "${employeeName}" selected from dropdown`);
  }

  async selectStatus(status: string): Promise<void> {
    logger.info(`Selecting status: ${status}`);
    await this.click(this.statusDropdown);
    await this.page.waitForTimeout(500);
    const statusOption = this.page.getByRole('option', { name: status, exact: true });
    await this.click(statusOption);
    logger.info(`Status "${status}" selected`);
  }

  /**
   * Action Methods
   */

  async clickSearchButton(): Promise<void> {
    logger.info('Clicking search button');
    await this.click(this.searchButton);
    await this.page.waitForTimeout(1000); // Wait for results to load
    logger.info('Search button clicked');
  }

  async clickResetButton(): Promise<void> {
    logger.info('Clicking reset button');
    await this.click(this.resetButton);
    await this.page.waitForTimeout(500);
    logger.info('Reset button clicked');
  }

  async clickAddButton(): Promise<void> {
    logger.info('Clicking add button');
    await this.click(this.addButton);
    logger.info('Add button clicked');
  }

  /**
   * Search convenience method - combines filter input and search
   */
  async searchByUsername(username: string): Promise<void> {
    await this.enterUsernameFilter(username);
    await this.clickSearchButton();
  }

  async searchByUserRole(role: string): Promise<void> {
    await this.selectUserRole(role);
    await this.clickSearchButton();
  }

  async searchByStatus(status: string): Promise<void> {
    await this.selectStatus(status);
    await this.clickSearchButton();
  }

  /**
   * Validation Methods - Results
   */

  async getResultsCount(): Promise<number> {
    try {
      const count = await this.tableRows.count();
      logger.info(`Found ${count} results`);
      return count;
    } catch (error) {
      logger.warn('Could not get results count');
      return 0;
    }
  }

  async isNoRecordsMessageDisplayed(): Promise<boolean> {
    try {
      await this.waitForElement(this.noRecordsMessage, 5000);
      const isVisible = await this.isVisible(this.noRecordsMessage);
      logger.info(`No records message displayed: ${isVisible}`);
      return isVisible;
    } catch (error) {
      return false;
    }
  }

  async areResultsDisplayed(): Promise<boolean> {
    const count = await this.getResultsCount();
    return count > 0;
  }

  async getAllUsernames(): Promise<string[]> {
    const usernames: string[] = [];
    const count = await this.usernameColumn.count();
    
    for (let i = 0; i < count; i++) {
      const username = await this.usernameColumn.nth(i).textContent();
      if (username) {
        usernames.push(username.trim());
      }
    }
    
    logger.info(`Retrieved ${usernames.length} usernames from results`);
    return usernames;
  }

  async getAllUserRoles(): Promise<string[]> {
    const roles: string[] = [];
    const count = await this.userRoleColumn.count();
    
    for (let i = 0; i < count; i++) {
      const role = await this.userRoleColumn.nth(i).textContent();
      if (role) {
        roles.push(role.trim());
      }
    }
    
    logger.info(`Retrieved ${roles.length} roles from results`);
    return roles;
  }

  async getAllEmployeeNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.employeeNameColumn.count();
    
    for (let i = 0; i < count; i++) {
      const name = await this.employeeNameColumn.nth(i).textContent();
      if (name) {
        names.push(name.trim());
      }
    }
    
    logger.info(`Retrieved ${names.length} employee names from results`);
    return names;
  }

  async getAllStatuses(): Promise<string[]> {
    const statuses: string[] = [];
    const count = await this.statusColumn.count();
    
    for (let i = 0; i < count; i++) {
      const status = await this.statusColumn.nth(i).textContent();
      if (status) {
        statuses.push(status.trim());
      }
    }
    
    logger.info(`Retrieved ${statuses.length} statuses from results`);
    return statuses;
  }

  /**
   * Filter Field Validation Methods
   */

  async isUsernameFilterVisible(): Promise<boolean> {
    return await this.isVisible(this.usernameFilterInput);
  }

  async isUserRoleDropdownVisible(): Promise<boolean> {
    return await this.isVisible(this.userRoleDropdown);
  }

  async isEmployeeNameInputVisible(): Promise<boolean> {
    return await this.isVisible(this.employeeNameInput);
  }

  async isStatusDropdownVisible(): Promise<boolean> {
    return await this.isVisible(this.statusDropdown);
  }

  async isSearchButtonVisible(): Promise<boolean> {
    return await this.isVisible(this.searchButton);
  }

  async isResetButtonVisible(): Promise<boolean> {
    return await this.isVisible(this.resetButton);
  }

  async isAddButtonVisible(): Promise<boolean> {
    return await this.isVisible(this.addButton);
  }

  /**
   * Filter Clear Validation
   */

  async isUsernameFilterEmpty(): Promise<boolean> {
    const value = await this.usernameFilterInput.inputValue();
    return value === '';
  }

  async isEmployeeNameFilterEmpty(): Promise<boolean> {
    const value = await this.employeeNameInput.inputValue();
    return value === '';
  }

  async areAllFiltersCleared(): Promise<boolean> {
    const usernameEmpty = await this.isUsernameFilterEmpty();
    const employeeNameEmpty = await this.isEmployeeNameFilterEmpty();
    return usernameEmpty && employeeNameEmpty;
  }

  /**
   * Validation - Results match filters
   */

  async verifyUsernamesContain(searchTerm: string): Promise<boolean> {
    const usernames = await this.getAllUsernames();
    const allMatch = usernames.every(username => 
      username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    logger.info(`Usernames contain "${searchTerm}": ${allMatch}`);
    return allMatch;
  }

  async verifyAllRolesMatch(expectedRole: string): Promise<boolean> {
    const roles = await this.getAllUserRoles();
    const allMatch = roles.every(role => 
      role.toLowerCase() === expectedRole.toLowerCase()
    );
    logger.info(`All roles match "${expectedRole}": ${allMatch}`);
    return allMatch;
  }

  async verifyEmployeeNamesContain(searchTerm: string): Promise<boolean> {
    const names = await this.getAllEmployeeNames();
    const allMatch = names.every(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    logger.info(`Employee names contain "${searchTerm}": ${allMatch}`);
    return allMatch;
  }

  async verifyAllStatusesMatch(expectedStatus: string): Promise<boolean> {
    const statuses = await this.getAllStatuses();
    const allMatch = statuses.every(status => 
      status.toLowerCase() === expectedStatus.toLowerCase()
    );
    logger.info(`All statuses match "${expectedStatus}": ${allMatch}`);
    return allMatch;
  }

  /**
   * Table state validation
   */

  async isResultsTableEmpty(): Promise<boolean> {
    const count = await this.getResultsCount();
    return count === 0;
  }

  async waitForResultsToLoad(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.waitForElement(this.resultsTable, 5000);
  }

  /**
   * Action buttons validation (Edit/Delete)
   */

  async getEditButtonsCount(): Promise<number> {
    const editButtons = this.page.locator('.oxd-table-cell-actions button, .oxd-icon-button').filter({ has: this.page.locator('i.bi-pencil-fill, i[class*="edit"]') });
    const count = await editButtons.count();
    logger.info(`Found ${count} edit buttons`);
    return count;
  }

  async getDeleteButtonsCount(): Promise<number> {
    const deleteButtons = this.page.locator('.oxd-table-cell-actions button, .oxd-icon-button').filter({ has: this.page.locator('i.bi-trash, i[class*="trash"], i[class*="delete"]') });
    const count = await deleteButtons.count();
    logger.info(`Found ${count} delete buttons`);
    return count;
  }

  async doesEachRowHaveEditButton(): Promise<boolean> {
    const rowsCount = await this.getResultsCount();
    const editButtonsCount = await this.getEditButtonsCount();
    const hasEditButtons = rowsCount > 0 && editButtonsCount >= rowsCount;
    logger.info(`Each row has edit button: ${hasEditButtons} (rows: ${rowsCount}, buttons: ${editButtonsCount})`);
    return hasEditButtons;
  }

  async doesEachRowHaveDeleteButton(): Promise<boolean> {
    const rowsCount = await this.getResultsCount();
    const deleteButtonsCount = await this.getDeleteButtonsCount();
    const hasDeleteButtons = rowsCount > 0 && deleteButtonsCount >= rowsCount;
    logger.info(`Each row has delete button: ${hasDeleteButtons} (rows: ${rowsCount}, buttons: ${deleteButtonsCount})`);
    return hasDeleteButtons;
  }

  async areActionButtonsVisible(): Promise<boolean> {
    const actionsCell = this.page.locator('.oxd-table-cell-actions, .oxd-table-cell:last-child').first();
    const isVisible = await this.isVisible(actionsCell);
    logger.info(`Action buttons column visible: ${isVisible}`);
    return isVisible;
  }
}
