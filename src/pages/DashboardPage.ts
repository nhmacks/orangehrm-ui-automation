import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '@utils/Logger';

export class DashboardPage extends BasePage {
  // Locators
  private readonly dashboardHeader: Locator;
  private readonly userDropdown: Locator;
  private readonly logoutOption: Locator;
  private readonly searchInput: Locator;
  private readonly sideMenu: Locator;
  private readonly dashboardWidgets: Locator;
  private readonly profilePicture: Locator;

  // Menu items
  private readonly adminMenu: Locator;
  private readonly pimMenu: Locator;
  private readonly leaveMenu: Locator;
  private readonly timeMenu: Locator;
  private readonly recruitmentMenu: Locator;
  private readonly myInfoMenu: Locator;
  private readonly performanceMenu: Locator;
  private readonly dashboardMenu: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize main locators
    this.dashboardHeader = page.locator('.oxd-topbar-header-breadcrumb, .oxd-topbar-header').first();
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutOption = page.getByRole('menuitem', { name: 'Logout' });
    this.searchInput = page.getByPlaceholder('Search');
    this.sideMenu = page.locator('.oxd-sidepanel');
    this.dashboardWidgets = page.locator('.oxd-dashboard-widget');
    this.profilePicture = page.locator('.oxd-userdropdown-img');

    // Initialize menu items
    this.adminMenu = page.getByRole('link', { name: 'Admin' });
    this.pimMenu = page.getByRole('link', { name: 'PIM' });
    this.leaveMenu = page.getByRole('link', { name: 'Leave' });
    this.timeMenu = page.getByRole('link', { name: 'Time' });
    this.recruitmentMenu = page.getByRole('link', { name: 'Recruitment' });
    this.myInfoMenu = page.getByRole('link', { name: 'My Info' });
    this.performanceMenu = page.getByRole('link', { name: 'Performance' });
    this.dashboardMenu = page.getByRole('link', { name: 'Dashboard' });
  }

  /**
   * Verify dashboard is loaded
   */
  async isDashboardLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.dashboardHeader, 10000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if dashboard header is visible
   */
  async isDashboardHeaderVisible(): Promise<boolean> {
    try {
      await this.waitForElement(this.dashboardHeader, 5000);
      return await this.isVisible(this.dashboardHeader);
    } catch {
      return false;
    }
  }

  /**
   * Check if user dropdown is visible
   */
  async isUserDropdownVisible(): Promise<boolean> {
    try {
      await this.waitForElement(this.userDropdown, 5000);
      return await this.isVisible(this.userDropdown);
    } catch {
      return false;
    }
  }

  /**
   * Get dashboard header text
   */
  async getDashboardHeaderText(): Promise<string> {
    return await this.getText(this.dashboardHeader);
  }

  /**
   * Wait for dashboard to load and verify URL
   */
  async waitForDashboardLoad(timeout: number = 20000): Promise<void> {
    logger.info('Waiting for dashboard to load');
    await this.page.waitForURL(/.*dashboard/, { timeout });
    await this.waitForElement(this.dashboardHeader, 5000).catch(() => {
      logger.warn('Dashboard header not found within timeout');
    });
    logger.info('Dashboard loaded successfully');
  }

  /**
   * Verify user is on dashboard page
   */
  async isOnDashboardPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('dashboard');
  }

  /**
   * Click user dropdown
   */
  async clickUserDropdown(): Promise<void> {
    logger.info('Clicking user dropdown');
    await this.click(this.userDropdown);
  }

  /**
   * Click logout option
   */
  async clickLogout(): Promise<void> {
    logger.info('Clicking logout option');
    await this.click(this.logoutOption);
    await this.waitForPageLoad();
  }

  /**
   * Perform logout (composite action)
   */
  async logout(): Promise<void> {
    logger.info('Performing logout');
    await this.clickUserDropdown();
    await this.clickLogout();
    logger.info('Logout completed');
  }

  /**
   * Navigate to Admin module
   */
  async navigateToAdmin(): Promise<void> {
    logger.info('Navigating to Admin module');
    await this.click(this.adminMenu);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to PIM module
   */
  async navigateToPIM(): Promise<void> {
    logger.info('Navigating to PIM module');
    await this.click(this.pimMenu);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Leave module
   */
  async navigateToLeave(): Promise<void> {
    logger.info('Navigating to Leave module');
    await this.click(this.leaveMenu);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Time module
   */
  async navigateToTime(): Promise<void> {
    logger.info('Navigating to Time module');
    await this.click(this.timeMenu);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Recruitment module
   */
  async navigateToRecruitment(): Promise<void> {
    logger.info('Navigating to Recruitment module');
    await this.click(this.recruitmentMenu);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to My Info module
   */
  async navigateToMyInfo(): Promise<void> {
    logger.info('Navigating to My Info module');
    await this.click(this.myInfoMenu);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Performance module
   */
  async navigateToPerformance(): Promise<void> {
    logger.info('Navigating to Performance module');
    await this.click(this.performanceMenu);
    await this.waitForPageLoad();
  }

  /**
   * Search using top search bar
   */
  async search(searchTerm: string): Promise<void> {
    logger.info(`Searching for: ${searchTerm}`);
    await this.fill(this.searchInput, searchTerm);
    await this.pressKey('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Check if side menu is visible
   */
  async isSideMenuVisible(): Promise<boolean> {
    return await this.isVisible(this.sideMenu);
  }

  /**
   * Get dashboard widget count
   */
  async getDashboardWidgetCount(): Promise<number> {
    return await this.dashboardWidgets.count();
  }

  /**
   * Check if profile picture is displayed
   */
  async isProfilePictureDisplayed(): Promise<boolean> {
    return await this.isVisible(this.profilePicture);
  }

  /**
   * Navigate to specific module by name
   */
  async navigateToModule(moduleName: string): Promise<void> {
    logger.info(`Navigating to ${moduleName} module`);
    const menuItem = this.page.getByRole('link', { name: moduleName });
    await this.click(menuItem);
    await this.waitForPageLoad();
  }

  /**
   * Verify module is available in menu
   */
  async isModuleAvailable(moduleName: string): Promise<boolean> {
    const menuItem = this.page.getByRole('link', { name: moduleName });
    return await this.isVisible(menuItem);
  }

  /**
   * Check if user dropdown is visible in header
   */
  async isUserDropdownInHeaderVisible(): Promise<boolean> {
    try {
      await this.waitForElement(this.userDropdown, 5000);
      return await this.isVisible(this.userDropdown);
    } catch {
      return false;
    }
  }

  /**
   * Check if on dashboard page
   */
  async isOnDashboardPage(): Promise<boolean> {
    try {
      await this.page.waitForURL(/.*dashboard/, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
