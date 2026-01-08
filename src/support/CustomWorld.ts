import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import BrowserManager from './BrowserManager';
import ConfigManager from '@config/ConfigManager';
import { logger } from '@utils/Logger';

export interface ICustomWorld extends World {
  browser: Browser | null;
  context: BrowserContext | null;
  page: Page | null;
  testName: string;
  startTime: number;
  featureName: string;
  scenarioName: string;
}

export class CustomWorld extends World implements ICustomWorld {
  browser: Browser | null = null;
  context: BrowserContext | null = null;
  page: Page | null = null;
  testName: string = '';
  startTime: number = 0;
  featureName: string = '';
  scenarioName: string = '';

  constructor(options: IWorldOptions) {
    super(options);
    
    // Load configuration
    const worldConfig = options.parameters as any;
    if (worldConfig?.environment) {
      ConfigManager.setEnvironment(worldConfig.environment);
    }

    logger.info('CustomWorld initialized');
  }

  async init(): Promise<void> {
    this.browser = await BrowserManager.initBrowser();
    this.context = await BrowserManager.createContext();
    this.page = await BrowserManager.createPage();
    this.startTime = Date.now();
    
    logger.info('Browser, context, and page initialized in CustomWorld');
  }

  async cleanup(): Promise<void> {
    const duration = Date.now() - this.startTime;
    logger.info(`Test duration: ${duration}ms`);
    
    await BrowserManager.closeBrowser();
    logger.info('CustomWorld cleanup completed');
  }

  async takeScreenshot(name: string): Promise<Buffer | undefined> {
    if (!this.page) {
      logger.warn('Cannot take screenshot: page is null');
      return undefined;
    }

    try {
      const screenshotPath = ConfigManager.getTestConfig().screenshotPath;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${screenshotPath}/${name}-${timestamp}.png`;
      
      const screenshot = await this.page.screenshot({
        path: fileName,
        fullPage: true,
      });
      
      logger.info(`Screenshot saved: ${fileName}`);
      return screenshot;
    } catch (error) {
      logger.error('Failed to take screenshot', { error });
      return undefined;
    }
  }

  async attachScreenshot(name: string): Promise<void> {
    const screenshot = await this.takeScreenshot(name);
    if (screenshot) {
      this.attach(screenshot, 'image/png');
    }
  }

  async saveTrace(name: string): Promise<void> {
    if (!this.context) {
      logger.warn('Cannot save trace: context is null');
      return;
    }

    try {
      const tracePath = `./reports/traces/${name}-${Date.now()}.zip`;
      await this.context.tracing.stop({ path: tracePath });
      logger.info(`Trace saved: ${tracePath}`);
      
      // Restart tracing for next scenario
      const config = ConfigManager.getBrowserConfig();
      if (config.trace !== 'off') {
        await this.context.tracing.start({ screenshots: true, snapshots: true });
      }
    } catch (error) {
      logger.error('Failed to save trace', { error });
    }
  }

  getTestDuration(): number {
    return Date.now() - this.startTime;
  }
}

setWorldConstructor(CustomWorld);
