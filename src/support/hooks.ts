import { Before, After, BeforeAll, AfterAll, AfterStep, Status } from '@cucumber/cucumber';
import { ICustomWorld } from './CustomWorld';
import { logger } from '@utils/Logger';
import ConfigManager from '@config/ConfigManager';
import fs from 'fs';
import path from 'path';

// Create necessary directories before all tests
BeforeAll(async function() {
  logger.info('=== Test Suite Starting ===');
  logger.info(`Environment: ${ConfigManager.getEnvironment()}`);
  logger.info(`Configuration: ${JSON.stringify(ConfigManager.getFullConfig(), null, 2)}`);

  const testConfig = ConfigManager.getTestConfig();
  
  // Create directories if they don't exist
  const directories = [
    testConfig.reportPath,
    testConfig.screenshotPath,
    testConfig.videoPath,
    path.join(testConfig.reportPath, 'traces'),
    'logs',
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  });
});

// Cleanup after all tests
AfterAll(async function() {
  logger.info('=== Test Suite Completed ===');
});

// Initialize browser before each scenario
Before({ timeout: 60000 }, async function(this: ICustomWorld, { pickle, gherkinDocument }) {
  this.testName = pickle.name;
  this.scenarioName = pickle.name;
  this.featureName = gherkinDocument.feature?.name || 'Unknown Feature';

  logger.info('='.repeat(80));
  logger.info(`Starting Scenario: ${this.scenarioName}`);
  logger.info(`Feature: ${this.featureName}`);
  logger.info(`Tags: ${pickle.tags.map(t => t.name).join(', ')}`);
  logger.info('='.repeat(80));

  await this.init();
});

// Take screenshot after each step if configured
AfterStep(async function(this: ICustomWorld, { pickle, pickleStep, result }) {
  const config = ConfigManager.getBrowserConfig();
  
  // Take screenshot on failure or if configured to take on every step
  if (result.status === Status.FAILED) {
    logger.error(`Step failed: ${pickleStep.text}`);
    await this.attachScreenshot(`failed-step-${pickleStep.text.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }

  // Log step execution
  const statusEmoji = result.status === Status.PASSED ? '✓' : 
                      result.status === Status.FAILED ? '✗' : '⊘';
  logger.info(`${statusEmoji} Step: ${pickleStep.text} [${result.status}]`);
});

// Cleanup after each scenario
After(async function(this: ICustomWorld, { pickle, result }) {
  const duration = this.getTestDuration();
  
  logger.info('-'.repeat(80));
  logger.info(`Scenario: ${pickle.name}`);
  logger.info(`Status: ${result.status}`);
  logger.info(`Duration: ${duration}ms`);
  logger.info('-'.repeat(80));

  // Take screenshot on failure
  if (result.status === Status.FAILED) {
    logger.error(`Scenario failed: ${pickle.name}`);
    
    const config = ConfigManager.getBrowserConfig();
    
    // Attach screenshot
    if (config.screenshot === 'only-on-failure' || config.screenshot === 'on') {
      await this.attachScreenshot(`failed-${pickle.name.replace(/[^a-zA-Z0-9]/g, '-')}`);
    }

    // Save trace on failure
    if (config.trace === 'retain-on-failure' || config.trace === 'on') {
      await this.saveTrace(`failed-${pickle.name.replace(/[^a-zA-Z0-9]/g, '-')}`);
    }

    // Attach error details
    if (result.message) {
      this.attach(result.message, 'text/plain');
    }
  }

  // Cleanup browser resources
  await this.cleanup();
});

// Tag-based hooks
Before({ tags: '@smoke' }, async function(this: ICustomWorld) {
  logger.info('Running smoke test');
});

Before({ tags: '@regression' }, async function(this: ICustomWorld) {
  logger.info('Running regression test');
});

Before({ tags: '@skip or @wip' }, async function(this: ICustomWorld) {
  logger.warn('Skipping scenario marked with @skip or @wip');
  return 'skipped';
});

// Environment-specific hooks
Before({ tags: '@dev-only' }, async function(this: ICustomWorld) {
  const env = ConfigManager.getEnvironment();
  if (env !== 'dev') {
    logger.warn(`Skipping @dev-only test in ${env} environment`);
    return 'skipped';
  }
});

Before({ tags: '@prod-only' }, async function(this: ICustomWorld) {
  const env = ConfigManager.getEnvironment();
  if (env !== 'prod') {
    logger.warn(`Skipping @prod-only test in ${env} environment`);
    return 'skipped';
  }
});
