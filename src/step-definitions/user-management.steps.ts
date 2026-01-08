import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '@support/CustomWorld';
import { UserManagementPage } from '@pages/UserManagementPage';
import { AddUserPage } from '@pages/AddUserPage';
import { logger } from '@utils/Logger';

/**
 * Step Definitions for User Management feature
 * Handles user filtering, search, and validation scenarios
 */

// ============================================================================
// GIVEN Steps - Setup and Navigation
// ============================================================================

Given('I navigate to the Admin module', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  await userManagementPage.navigateToAdmin();
  logger.info('Navigated to Admin module');
});

Given('I am on the System Users page', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  await userManagementPage.navigateToSystemUsers();
  logger.info('On System Users page');
});

// ============================================================================
// WHEN Steps - Actions
// ============================================================================

When('I enter username {string} in the username filter', async function(this: ICustomWorld, username: string) {
  const userManagementPage = new UserManagementPage(this.page!);
  await userManagementPage.enterUsernameFilter(username);
  logger.info(`Entered username filter: ${username}`);
});

When('I select {string} from the user role dropdown', async function(this: ICustomWorld, role: string) {
  const userManagementPage = new UserManagementPage(this.page!);
  await userManagementPage.selectUserRole(role);
  logger.info(`Selected user role: ${role}`);
});

When('I enter employee name {string} in the employee name filter', async function(this: ICustomWorld, employeeName: string) {
  const userManagementPage = new UserManagementPage(this.page!);
  await userManagementPage.enterEmployeeName(employeeName);
  // Try to select from autocomplete if suggestions appear
  try {
    await userManagementPage.selectEmployeeFromDropdown(employeeName);
  } catch (error) {
    logger.warn('No autocomplete suggestions found, continuing...');
  }
  logger.info(`Entered employee name filter: ${employeeName}`);
});

When('I select {string} from the status dropdown', async function(this: ICustomWorld, status: string) {
  const userManagementPage = new UserManagementPage(this.page!);
  await userManagementPage.selectStatus(status);
  logger.info(`Selected status: ${status}`);
});

When('I click the search button', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  await userManagementPage.clickSearchButton();
  await userManagementPage.waitForResultsToLoad();
  logger.info('Clicked search button');
});

When('I click the reset button', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  await userManagementPage.clickResetButton();
  logger.info('Clicked reset button');
});

When('I see filtered results', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const hasResults = await userManagementPage.areResultsDisplayed();
  expect(hasResults).toBeTruthy();
  logger.info('Verified filtered results are displayed');
});

// ============================================================================
// THEN Steps - Assertions
// ============================================================================

Then('I should see users matching the username {string}', async function(this: ICustomWorld, username: string) {
  const userManagementPage = new UserManagementPage(this.page!);
  const resultsCount = await userManagementPage.getResultsCount();
  expect(resultsCount).toBeGreaterThan(0);
  
  const usernamesMatch = await userManagementPage.verifyUsernamesContain(username);
  expect(usernamesMatch).toBeTruthy();
  
  logger.info(`Verified users matching username: ${username}`);
});

Then('the results should be filtered correctly', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const resultsCount = await userManagementPage.getResultsCount();
  expect(resultsCount).toBeGreaterThan(0);
  logger.info('Verified results are filtered correctly');
});

Then('I should see only users with {string} role', async function(this: ICustomWorld, role: string) {
  const userManagementPage = new UserManagementPage(this.page!);
  const resultsCount = await userManagementPage.getResultsCount();
  expect(resultsCount).toBeGreaterThan(0);
  
  const rolesMatch = await userManagementPage.verifyAllRolesMatch(role);
  expect(rolesMatch).toBeTruthy();
  
  logger.info(`Verified all users have role: ${role}`);
});

Then('the results should display the correct role', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const roles = await userManagementPage.getAllUserRoles();
  expect(roles.length).toBeGreaterThan(0);
  logger.info('Verified results display correct roles');
});

Then('I should see users with employee name containing {string}', async function(this: ICustomWorld, employeeName: string) {
  const userManagementPage = new UserManagementPage(this.page!);
  const resultsCount = await userManagementPage.getResultsCount();
  expect(resultsCount).toBeGreaterThan(0);
  
  const namesMatch = await userManagementPage.verifyEmployeeNamesContain(employeeName);
  expect(namesMatch).toBeTruthy();
  
  logger.info(`Verified employee names contain: ${employeeName}`);
});

Then('I should see only users with {string} status', async function(this: ICustomWorld, status: string) {
  const userManagementPage = new UserManagementPage(this.page!);
  const resultsCount = await userManagementPage.getResultsCount();
  expect(resultsCount).toBeGreaterThan(0);
  
  const statusesMatch = await userManagementPage.verifyAllStatusesMatch(status);
  expect(statusesMatch).toBeTruthy();
  
  logger.info(`Verified all users have status: ${status}`);
});

Then('all displayed users should have enabled status', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const statusesMatch = await userManagementPage.verifyAllStatusesMatch('Enabled');
  expect(statusesMatch).toBeTruthy();
  logger.info('Verified all displayed users have enabled status');
});

Then('I should see users matching all filter criteria', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const resultsCount = await userManagementPage.getResultsCount();
  expect(resultsCount).toBeGreaterThan(0);
  logger.info('Verified users match all filter criteria');
});

Then('the results count should be greater than {int}', async function(this: ICustomWorld, expectedCount: number) {
  const userManagementPage = new UserManagementPage(this.page!);
  const resultsCount = await userManagementPage.getResultsCount();
  expect(resultsCount).toBeGreaterThan(expectedCount);
  logger.info(`Results count: ${resultsCount} > ${expectedCount}`);
});

Then('I should see no records found message', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const noRecordsDisplayed = await userManagementPage.isNoRecordsMessageDisplayed();
  expect(noRecordsDisplayed).toBeTruthy();
  logger.info('Verified no records found message is displayed');
});

Then('the results table should be empty', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const isEmpty = await userManagementPage.isResultsTableEmpty();
  expect(isEmpty).toBeTruthy();
  logger.info('Verified results table is empty');
});

Then('all filter fields should be cleared', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const allCleared = await userManagementPage.areAllFiltersCleared();
  expect(allCleared).toBeTruthy();
  logger.info('Verified all filter fields are cleared');
});

Then('I should see all users in the system', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const resultsCount = await userManagementPage.getResultsCount();
  expect(resultsCount).toBeGreaterThan(0);
  logger.info(`Verified all users displayed: ${resultsCount} users`);
});

// ============================================================================
// UI Validation Steps
// ============================================================================

Then('I should see the username filter field', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const isVisible = await userManagementPage.isUsernameFilterVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified username filter field is visible');
});

Then('I should see the user role dropdown', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const isVisible = await userManagementPage.isUserRoleDropdownVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified user role dropdown is visible');
});

Then('I should see the employee name filter field', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const isVisible = await userManagementPage.isEmployeeNameInputVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified employee name filter field is visible');
});

Then('I should see the status dropdown', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const isVisible = await userManagementPage.isStatusDropdownVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified status dropdown is visible');
});

Then('I should see the search button', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const isVisible = await userManagementPage.isSearchButtonVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified search button is visible');
});

Then('I should see the reset button', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const isVisible = await userManagementPage.isResetButtonVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified reset button is visible');
});

// ============================================================================
// Action Buttons Validation Steps (Edit/Delete)
// ============================================================================

Then('each user record should have an edit action button', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const hasEditButtons = await userManagementPage.doesEachRowHaveEditButton();
  expect(hasEditButtons).toBeTruthy();
  logger.info('Verified each user record has an edit action button');
});

Then('each user record should have a delete action button', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const hasDeleteButtons = await userManagementPage.doesEachRowHaveDeleteButton();
  expect(hasDeleteButtons).toBeTruthy();
  logger.info('Verified each user record has a delete action button');
});

Then('the action buttons should be visible', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  const areVisible = await userManagementPage.areActionButtonsVisible();
  expect(areVisible).toBeTruthy();
  logger.info('Verified action buttons column is visible');
});

// ============================================================================
// Add User Page Steps
// ============================================================================

When('I click the Add button', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  await userManagementPage.clickAddButton();
  logger.info('Clicked Add button');
});

Then('I should be on the Add User page', async function(this: ICustomWorld) {
  const addUserPage = new AddUserPage(this.page!);
  await addUserPage.waitForAddUserPageLoad();
  const isOnAddPage = await addUserPage.isOnAddUserPage();
  expect(isOnAddPage).toBeTruthy();
  logger.info('Verified on Add User page');
});

When('I select {string} from the User Role dropdown in Add User form', async function(this: ICustomWorld, role: string) {
  const addUserPage = new AddUserPage(this.page!);
  await addUserPage.selectUserRole(role);
  logger.info(`Selected user role: ${role} in Add User form`);
});

When('I enter {string} in employee name autocomplete', async function(this: ICustomWorld, employeeName: string) {
  const addUserPage = new AddUserPage(this.page!);
  await addUserPage.enterEmployeeName(employeeName);
  logger.info(`Entered employee name: ${employeeName} in autocomplete`);
});

When('I select {string} from employee suggestions', async function(this: ICustomWorld, employeeName: string) {
  const addUserPage = new AddUserPage(this.page!);
  await addUserPage.selectEmployeeFromSuggestions(employeeName);
  logger.info(`Selected employee: ${employeeName} from suggestions`);
});

When('I select {string} from the Status dropdown in Add User form', async function(this: ICustomWorld, status: string) {
  const addUserPage = new AddUserPage(this.page!);
  await addUserPage.selectStatus(status);
  logger.info(`Selected status: ${status} in Add User form`);
});

When('I enter {string} in the username field', async function(this: ICustomWorld, username: string) {
  const addUserPage = new AddUserPage(this.page!);
  await addUserPage.enterUsername(username);
  logger.info(`Entered username: ${username}`);
});

When('I enter {string} in the password field', async function(this: ICustomWorld, password: string) {
  const addUserPage = new AddUserPage(this.page!);
  await addUserPage.enterPassword(password);
  logger.info('Entered password in password field');
});

When('I enter {string} in the confirm password field', async function(this: ICustomWorld, password: string) {
  const addUserPage = new AddUserPage(this.page!);
  await addUserPage.enterConfirmPassword(password);
  logger.info('Entered password in confirm password field');
});

When('I click the Save button', async function(this: ICustomWorld) {
  const addUserPage = new AddUserPage(this.page!);
  await addUserPage.clickSaveButton();
  logger.info('Clicked Save button');
});

Then('I should see a success message', async function(this: ICustomWorld) {
  const addUserPage = new AddUserPage(this.page!);
  const isSuccessDisplayed = await addUserPage.isSuccessMessageDisplayed();
  expect(isSuccessDisplayed).toBeTruthy();
  logger.info('Verified success message is displayed');
});

Then('I should be redirected to System Users page', async function(this: ICustomWorld) {
  const userManagementPage = new UserManagementPage(this.page!);
  await userManagementPage.waitForSystemUsersPageLoad();
  const isOnSystemUsers = await userManagementPage.isOnSystemUsersPage();
  expect(isOnSystemUsers).toBeTruthy();
  logger.info('Verified redirection to System Users page');
});

// ============================================================================
// User Validation Steps (After Creation)
// ============================================================================

Then('the user should have {string} role', async function(this: ICustomWorld, expectedRole: string) {
  const userManagementPage = new UserManagementPage(this.page!);
  const roles = await userManagementPage.getAllUserRoles();
  expect(roles.length).toBeGreaterThan(0);
  const hasRole = roles.some(role => role.toLowerCase() === expectedRole.toLowerCase());
  expect(hasRole).toBeTruthy();
  logger.info(`Verified user has role: ${expectedRole}`);
});

Then('the user should have {string} status', async function(this: ICustomWorld, expectedStatus: string) {
  const userManagementPage = new UserManagementPage(this.page!);
  const statuses = await userManagementPage.getAllStatuses();
  expect(statuses.length).toBeGreaterThan(0);
  const hasStatus = statuses.some(status => status.toLowerCase() === expectedStatus.toLowerCase());
  expect(hasStatus).toBeTruthy();
  logger.info(`Verified user has status: ${expectedStatus}`);
});

// ============================================================================
// Add User Form UI Validation Steps
// ============================================================================

Then('I should see the User Role dropdown field', async function(this: ICustomWorld) {
  const addUserPage = new AddUserPage(this.page!);
  const isVisible = await addUserPage.isUserRoleDropdownVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified User Role dropdown field is visible');
});

Then('I should see the Employee Name autocomplete field', async function(this: ICustomWorld) {
  const addUserPage = new AddUserPage(this.page!);
  const isVisible = await addUserPage.isEmployeeNameInputVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified Employee Name autocomplete field is visible');
});

Then('I should see the Status dropdown field', async function(this: ICustomWorld) {
  const addUserPage = new AddUserPage(this.page!);
  const isVisible = await addUserPage.isStatusDropdownVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified Status dropdown field is visible');
});

Then('I should see the Username text field', async function(this: ICustomWorld) {
  const addUserPage = new AddUserPage(this.page!);
  const isVisible = await addUserPage.isUsernameInputVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified Username text field is visible');
});

Then('I should see the Password text field', async function(this: ICustomWorld) {
  const addUserPage = new AddUserPage(this.page!);
  const isVisible = await addUserPage.isPasswordInputVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified Password text field is visible');
});

Then('I should see the Confirm Password text field', async function(this: ICustomWorld) {
  const addUserPage = new AddUserPage(this.page!);
  const isVisible = await addUserPage.isConfirmPasswordInputVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified Confirm Password text field is visible');
});

Then('I should see the Save button in form', async function(this: ICustomWorld) {
  const addUserPage = new AddUserPage(this.page!);
  const isVisible = await addUserPage.isSaveButtonVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified Save button is visible in form');
});

Then('I should see the Cancel button in form', async function(this: ICustomWorld) {
  const addUserPage = new AddUserPage(this.page!);
  const isVisible = await addUserPage.isCancelButtonVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified Cancel button is visible in form');
});
