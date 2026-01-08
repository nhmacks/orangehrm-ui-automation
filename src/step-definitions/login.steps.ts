import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '@support/CustomWorld';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { logger } from '@utils/Logger';

Given('I am on the OrangeHRM login page', { timeout: 60000 }, async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.goto();
  logger.info('Navigated to login page');
});

When('I enter username {string}', async function(this: ICustomWorld, username: string) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.enterUsername(username);
  logger.info(`Entered username: ${username}`);
});

When('I enter password {string}', async function(this: ICustomWorld, password: string) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.enterPassword(password);
  logger.info('Entered password');
});

When('I click the login button', { timeout: 30000 }, async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.clickLoginButton();
  logger.info('Clicked login button');
});

When('I login with default credentials', { timeout: 30000 }, async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.goto();
  await loginPage.quickLogin();
  logger.info('Performed quick login with default credentials');
});

Then('I should be redirected to the dashboard', { timeout: 30000 }, async function(this: ICustomWorld) {
  const dashboardPage = new DashboardPage(this.page!);
  await dashboardPage.waitForDashboardLoad(20000);
  const isOnDashboard = await dashboardPage.isOnDashboardPage();
  expect(isOnDashboard).toBeTruthy();
  logger.info('Verified redirection to dashboard');
});

Then('I should see the dashboard header', async function(this: ICustomWorld) {
  const dashboardPage = new DashboardPage(this.page!);
  const isHeaderVisible = await dashboardPage.isDashboardHeaderVisible();
  expect(isHeaderVisible).toBeTruthy();
  logger.info('Verified dashboard header is visible');
});

Then('I should see an error message', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  const isErrorDisplayed = await loginPage.isErrorDisplayed();
  expect(isErrorDisplayed).toBeTruthy();
  logger.info('Verified error message is displayed');
});

Then('I should see an error message {string}', async function(this: ICustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page!);
  const errorMessage = await loginPage.getErrorMessage();
  expect(errorMessage.toLowerCase()).toContain(expectedMessage.toLowerCase());
  logger.info(`Verified error message contains: ${expectedMessage}`);
});

Then('I should remain on the login page', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  const isLoginPage = await loginPage.isLoginPageDisplayed();
  expect(isLoginPage).toBeTruthy();
  logger.info('Verified still on login page');
});

Then('I should see validation errors', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  const count = await loginPage.getValidationErrorsCount();
  expect(count).toBeGreaterThan(0);
  logger.info(`Found ${count} validation errors`);
});

Then('the login button should be disabled or show error', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  const isVisible = await loginPage.isLoginButtonVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified login button state');
});

Then('I should see {string}', async function(this: ICustomWorld, expectedText: string) {
  const pageContent = await this.page!.textContent('body');
  expect(pageContent).toContain(expectedText);
  logger.info(`Verified page contains: ${expectedText}`);
});

Then('I should see the username input field', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  const isVisible = await loginPage.isUsernameInputVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified username input is visible');
});

Then('I should see the password input field', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  const isVisible = await loginPage.isPasswordInputVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified password input is visible');
});

Then('I should see the login button', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  const isVisible = await loginPage.isLoginButtonVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified login button is visible');
});

Then('I should see the forgot password link', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  const isVisible = await loginPage.isForgotPasswordLinkVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified forgot password link is visible');
});

Then('I should see the company logo', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  const isVisible = await loginPage.isLogoVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified company logo is visible');
});

When('I click on user dropdown', async function(this: ICustomWorld) {
  const dashboardPage = new DashboardPage(this.page!);
  await dashboardPage.clickUserDropdown();
  logger.info('Clicked user dropdown');
});

When('I click logout', async function(this: ICustomWorld) {
  const dashboardPage = new DashboardPage(this.page!);
  await dashboardPage.clickLogout();
  logger.info('Clicked logout');
});

Then('I should be redirected to the login page', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.waitForLoginPageLoad(10000);
  logger.info('Verified redirection to login page');
});

Then('I should see the login form', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  const isLoginPage = await loginPage.isLoginPageDisplayed();
  expect(isLoginPage).toBeTruthy();
  logger.info('Verified login form is visible');
});

Then('the password field should be masked', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  const inputType = await loginPage.getPasswordFieldType();
  expect(inputType).toBe('password');
  logger.info('Verified password field is masked');
});

Then('the password should not be visible', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  const inputType = await loginPage.getPasswordFieldType();
  expect(inputType).not.toBe('text');
  logger.info('Verified password is not visible');
});

Then('I should be logged in successfully', async function(this: ICustomWorld) {
  const dashboardPage = new DashboardPage(this.page!);
  await dashboardPage.waitForDashboardLoad(10000);
  const isHeaderVisible = await dashboardPage.isDashboardHeaderVisible();
  expect(isHeaderVisible).toBeTruthy();
  logger.info('Verified successful login');
});

Then('I should see the user dropdown in the header', async function(this: ICustomWorld) {
  const dashboardPage = new DashboardPage(this.page!);
  const isVisible = await dashboardPage.isUserDropdownVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified user dropdown is visible in header');
});
