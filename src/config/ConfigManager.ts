import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface EnvironmentConfig {
  baseUrl: string;
  username: string;
  password: string;
  apiBaseUrl?: string;
}

export interface BrowserConfig {
  browser: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  slowMo: number;
  timeout: number;
  navigationTimeout: number;
  actionTimeout: number;
  video: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
  screenshot: 'off' | 'on' | 'only-on-failure';
  trace: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
}

export interface TestConfig {
  environment: string;
  workers: number;
  retryCount: number;
  retryFlakyTests: boolean;
  reportPath: string;
  screenshotPath: string;
  videoPath: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  logToFile: boolean;
}

class ConfigManager {
  private static instance: ConfigManager;
  private currentEnv: string;

  private constructor() {
    this.currentEnv = process.env.TEST_ENV || 'dev';
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getEnvironment(): string {
    return this.currentEnv;
  }

  public setEnvironment(env: string): void {
    this.currentEnv = env;
  }

  public getEnvironmentConfig(): EnvironmentConfig {
    const env = this.currentEnv.toUpperCase();
    
    const config: EnvironmentConfig = {
      baseUrl: process.env[`${env}_BASE_URL`] || 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login',
      username: process.env[`${env}_USERNAME`] || 'Admin',
      password: process.env[`${env}_PASSWORD`] || 'admin123',
      apiBaseUrl: process.env.API_BASE_URL,
    };

    return config;
  }

  public getBrowserConfig(): BrowserConfig {
    return {
      browser: (process.env.BROWSER as any) || 'chromium',
      headless: process.env.HEADLESS !== 'false',
      slowMo: parseInt(process.env.SLOW_MO || '0'),
      timeout: parseInt(process.env.TIMEOUT || '30000'),
      navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000'),
      actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '10000'),
      video: (process.env.VIDEO as any) || 'off',
      screenshot: (process.env.SCREENSHOT as any) || 'only-on-failure',
      trace: (process.env.TRACE as any) || 'retain-on-failure',
    };
  }

  public getTestConfig(): TestConfig {
    return {
      environment: this.currentEnv,
      workers: parseInt(process.env.WORKERS || '2'),
      retryCount: parseInt(process.env.RETRY_COUNT || '0'),
      retryFlakyTests: process.env.RETRY_FLAKY_TESTS !== 'false',
      reportPath: process.env.REPORT_PATH || './reports',
      screenshotPath: process.env.SCREENSHOT_PATH || './screenshots',
      videoPath: process.env.VIDEO_PATH || './videos',
      logLevel: (process.env.LOG_LEVEL as any) || 'info',
      logToFile: process.env.LOG_TO_FILE !== 'false',
    };
  }

  public getFullConfig() {
    return {
      environment: this.getEnvironmentConfig(),
      browser: this.getBrowserConfig(),
      test: this.getTestConfig(),
    };
  }
}

export default ConfigManager.getInstance();
