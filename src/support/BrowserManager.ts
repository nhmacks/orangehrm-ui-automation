import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import ConfigManager from '@config/ConfigManager';
import { logger } from '@utils/Logger';

export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  private constructor() {}

  public static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  public async initBrowser(): Promise<Browser> {
    const config = ConfigManager.getBrowserConfig();
    
    const launchOptions = {
      headless: config.headless,
      slowMo: config.slowMo,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ],
    };

    logger.info(`Launching ${config.browser} browser...`);

    switch (config.browser) {
      case 'firefox':
        this.browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
        this.browser = await webkit.launch(launchOptions);
        break;
      default:
        this.browser = await chromium.launch(launchOptions);
    }

    return this.browser;
  }

  public async createContext(): Promise<BrowserContext> {
    if (!this.browser) {
      await this.initBrowser();
    }

    const config = ConfigManager.getBrowserConfig();
    const testConfig = ConfigManager.getTestConfig();

    this.context = await this.browser!.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      recordVideo: config.video !== 'off' 
        ? { dir: testConfig.videoPath } 
        : undefined,
      ...(config.screenshot !== 'off' && { 
        screenshot: 'on',
      }),
    });

    // Enable tracing if configured
    if (config.trace !== 'off') {
      await this.context.tracing.start({ screenshots: true, snapshots: true });
    }

    logger.info('Browser context created successfully');
    return this.context;
  }

  public async createPage(): Promise<Page> {
    if (!this.context) {
      await this.createContext();
    }

    this.page = await this.context!.newPage();
    
    const config = ConfigManager.getBrowserConfig();
    this.page.setDefaultTimeout(config.timeout);
    this.page.setDefaultNavigationTimeout(config.navigationTimeout);

    logger.info('New page created');
    return this.page;
  }

  public async closePage(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
      logger.info('Page closed');
    }
  }

  public async closeContext(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
      logger.info('Browser context closed');
    }
  }

  public async closeBrowser(): Promise<void> {
    await this.closePage();
    await this.closeContext();
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed');
    }
  }

  public getBrowser(): Browser | null {
    return this.browser;
  }

  public getContext(): BrowserContext | null {
    return this.context;
  }

  public getPage(): Page | null {
    return this.page;
  }
}

export default BrowserManager.getInstance();
