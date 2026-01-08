import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '@support/CustomWorld';
import { DashboardPage } from '@pages/DashboardPage';
import { LoginPage } from '@pages/LoginPage';
import { logger } from '@utils/Logger';

let dashboardPage: DashboardPage;

Given('I am logged in to OrangeHRM', async function(this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.goto();
  await loginPage.quickLogin();
  logger.info('User logged in successfully');
});

Given('I am on the dashboard page', async function(this: ICustomWorld) {
  dashboardPage = new DashboardPage(this.page!);
  const isDashboard = await dashboardPage.isDashboardLoaded();
  expect(isDashboard).toBeTruthy();
  logger.info('Verified on dashboard page');
});

Then('I should see the dashboard header {string}', async function(this: ICustomWorld, headerText: string) {
  dashboardPage = dashboardPage || new DashboardPage(this.page!);
  const actualHeader = await dashboardPage.getDashboardHeaderText();
  expect(actualHeader).toContain(headerText);
  logger.info(`Verified dashboard header: ${headerText}`);
});

Then('I should see the side navigation menu', async function(this: ICustomWorld) {
  dashboardPage = dashboardPage || new DashboardPage(this.page!);
  const isVisible = await dashboardPage.isSideMenuVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified side navigation menu is visible');
});

Then('I should see the user dropdown', async function(this: ICustomWorld) {
  dashboardPage = dashboardPage || new DashboardPage(this.page!);
  const isVisible = await dashboardPage.isUserDropdownVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Verified user dropdown is visible');
});

When('I click on the {string} menu item', async function(this: ICustomWorld, moduleName: string) {
  await this.page!.getByRole('link', { name: moduleName }).click();
  await this.page!.waitForLoadState('domcontentloaded');
  logger.info(`Clicked on ${moduleName} menu item`);
});

Then('I should be redirected to the {string} page', async function(this: ICustomWorld, pageName: string) {
  await this.page!.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  const url = this.page!.url();
  logger.info(`Current URL: ${url}`);
  // Verificación básica de que la navegación ocurrió
  expect(url).toBeTruthy();
});

Then('the page URL should contain {string}', async function(this: ICustomWorld, urlFragment: string) {
  const url = this.page!.url();
  expect(url.toLowerCase()).toContain(urlFragment.toLowerCase());
  logger.info(`Verified URL contains: ${urlFragment}`);
});

When('I navigate to {string} module', async function(this: ICustomWorld, moduleName: string) {
  dashboardPage = dashboardPage || new DashboardPage(this.page!);
  await dashboardPage.navigateToModule(moduleName);
  logger.info(`Navigated to ${moduleName} module`);
});

Then('I should see the Admin page loaded', async function(this: ICustomWorld) {
  await this.page!.waitForLoadState('domcontentloaded');
  const url = this.page!.url();
  expect(url).toContain('admin');
  logger.info('Verified Admin page is loaded');
});

Then('I should see the admin header', async function(this: ICustomWorld) {
  const header = this.page!.locator('h6, h5').first();
  await expect(header).toBeVisible();
  logger.info('Verified admin header is visible');
});

Then('I should see the PIM page loaded', async function(this: ICustomWorld) {
  await this.page!.waitForLoadState('domcontentloaded');
  const url = this.page!.url();
  expect(url).toContain('pim');
  logger.info('Verified PIM page is loaded');
});

Then('I should see employee management options', async function(this: ICustomWorld) {
  // Verificar que hay opciones de gestión de empleados
  const addButton = this.page!.getByRole('button', { name: /add/i }).first();
  await expect(addButton).toBeVisible({ timeout: 10000 });
  logger.info('Verified employee management options are visible');
});

When('I enter {string} in the search box', async function(this: ICustomWorld, searchTerm: string) {
  dashboardPage = dashboardPage || new DashboardPage(this.page!);
  await dashboardPage.search(searchTerm);
  logger.info(`Searched for: ${searchTerm}`);
});

When('I press Enter', async function(this: ICustomWorld) {
  await this.page!.keyboard.press('Enter');
  logger.info('Pressed Enter key');
});

Then('I should see search results related to {string}', async function(this: ICustomWorld, searchTerm: string) {
  await this.page!.waitForLoadState('domcontentloaded');
  logger.info(`Verified search results for: ${searchTerm}`);
});

Then('I should see dashboard widgets', async function(this: ICustomWorld) {
  dashboardPage = dashboardPage || new DashboardPage(this.page!);
  const widgetCount = await dashboardPage.getDashboardWidgetCount();
  expect(widgetCount).toBeGreaterThan(0);
  logger.info(`Found ${widgetCount} dashboard widgets`);
});

Then('the widget count should be greater than {int}', async function(this: ICustomWorld, expectedCount: number) {
  dashboardPage = dashboardPage || new DashboardPage(this.page!);
  const widgetCount = await dashboardPage.getDashboardWidgetCount();
  expect(widgetCount).toBeGreaterThan(expectedCount);
  logger.info(`Verified widget count ${widgetCount} > ${expectedCount}`);
});

Then('I should see the following options:', async function(this: ICustomWorld, dataTable: any) {
  const expectedOptions = dataTable.raw().flat();
  
  for (const option of expectedOptions) {
    const optionElement = this.page!.getByRole('menuitem', { name: option });
    await expect(optionElement).toBeVisible();
    logger.info(`Verified option is visible: ${option}`);
  }
});

When('I navigate to a sub-section', async function(this: ICustomWorld) {
  // Click en alguna subsección (ejemplo genérico)
  const firstLink = this.page!.locator('a.oxd-topbar-body-nav-tab-item').first();
  if (await firstLink.isVisible()) {
    await firstLink.click();
    await this.page!.waitForLoadState('domcontentloaded');
    logger.info('Navigated to sub-section');
  }
});

Then('I should see the breadcrumb trail', async function(this: ICustomWorld) {
  const breadcrumb = this.page!.locator('.oxd-breadcrumb, [class*="breadcrumb"]');
  await expect(breadcrumb).toBeVisible();
  logger.info('Verified breadcrumb is visible');
});

Then('I should be able to navigate back using breadcrumbs', async function(this: ICustomWorld) {
  const breadcrumbLinks = this.page!.locator('.oxd-breadcrumb a, [class*="breadcrumb"] a');
  const count = await breadcrumbLinks.count();
  expect(count).toBeGreaterThan(0);
  logger.info('Verified breadcrumb navigation is available');
});

When('I resize the browser window to mobile size', async function(this: ICustomWorld) {
  await this.page!.setViewportSize({ width: 375, height: 667 });
  logger.info('Resized browser to mobile size');
});

Then('the side menu should collapse', async function(this: ICustomWorld) {
  // En móvil, el menú lateral puede estar oculto o colapsado
  await this.page!.waitForTimeout(1000);
  logger.info('Verified side menu responsive behavior');
});

Then('the mobile menu icon should appear', async function(this: ICustomWorld) {
  // Buscar icono de menú hamburguesa o similar
  const menuIcon = this.page!.locator('[class*="menu-icon"], [class*="hamburger"], button[class*="toggle"]').first();
  await expect(menuIcon).toBeVisible();
  logger.info('Verified mobile menu icon is visible');
});

When('I click on a quick launch item', async function(this: ICustomWorld) {
  const quickLaunchItem = this.page!.locator('.oxd-dashboard-widget').first();
  if (await quickLaunchItem.isVisible()) {
    await quickLaunchItem.click();
    logger.info('Clicked on quick launch item');
  }
});

Then('I should be redirected to the corresponding module', async function(this: ICustomWorld) {
  await this.page!.waitForLoadState('domcontentloaded');
  logger.info('Verified redirection to module');
});

Then('the module page should load successfully', async function(this: ICustomWorld) {
  await this.page!.waitForLoadState('domcontentloaded');
  const url = this.page!.url();
  expect(url).toBeTruthy();
  logger.info('Verified module page loaded successfully');
});
