import fs from 'fs';
import path from 'path';
import reporter from 'cucumber-html-reporter';
import { logger } from './Logger';

export class ReportGenerator {
  private static reportsDir = path.join(process.cwd(), 'reports');
  private static jsonReport = path.join(ReportGenerator.reportsDir, 'cucumber-report.json');
  private static htmlReport = path.join(ReportGenerator.reportsDir, 'cucumber-report.html');

  /**
   * Generate HTML report from JSON
   */
  static generateHtmlReport(): void {
    if (!fs.existsSync(ReportGenerator.jsonReport)) {
      logger.error('JSON report not found. Cannot generate HTML report.');
      return;
    }

    const options = {
      theme: 'bootstrap',
      jsonFile: ReportGenerator.jsonReport,
      output: ReportGenerator.htmlReport,
      reportSuiteAsScenarios: true,
      scenarioTimestamp: true,
      launchReport: false,
      metadata: {
        'App Version': '1.0.0',
        'Test Environment': process.env.TEST_ENV || 'dev',
        Browser: process.env.BROWSER || 'chromium',
        Platform: process.platform,
        Parallel: process.env.WORKERS || '2',
        Executed: new Date().toISOString(),
      },
      brandTitle: 'OrangeHRM Test Automation Report',
      name: 'OrangeHRM',
    };

    try {
      reporter.generate(options);
      logger.info(`HTML report generated: ${ReportGenerator.htmlReport}`);
    } catch (error) {
      logger.error('Failed to generate HTML report', { error });
    }
  }

  /**
   * Generate test summary from JSON report
   */
  static generateSummary(): void {
    if (!fs.existsSync(ReportGenerator.jsonReport)) {
      logger.warn('JSON report not found. Cannot generate summary.');
      return;
    }

    try {
      const reportData = JSON.parse(fs.readFileSync(ReportGenerator.jsonReport, 'utf-8'));
      
      let totalScenarios = 0;
      let passedScenarios = 0;
      let failedScenarios = 0;
      let skippedScenarios = 0;
      let totalDuration = 0;

      reportData.forEach((feature: any) => {
        feature.elements.forEach((scenario: any) => {
          totalScenarios++;
          
          const scenarioStatus = scenario.steps.every((step: any) => 
            step.result.status === 'passed' || step.result.status === 'skipped'
          );
          
          if (scenarioStatus) {
            passedScenarios++;
          } else {
            failedScenarios++;
          }

          scenario.steps.forEach((step: any) => {
            if (step.result.duration) {
              totalDuration += step.result.duration;
            }
          });
        });
      });

      const summary = {
        total: totalScenarios,
        passed: passedScenarios,
        failed: failedScenarios,
        skipped: skippedScenarios,
        passRate: ((passedScenarios / totalScenarios) * 100).toFixed(2) + '%',
        duration: (totalDuration / 1000000000).toFixed(2) + 's',
      };

      logger.info('=== Test Execution Summary ===');
      logger.info(`Total Scenarios: ${summary.total}`);
      logger.info(`Passed: ${summary.passed}`);
      logger.info(`Failed: ${summary.failed}`);
      logger.info(`Skipped: ${summary.skipped}`);
      logger.info(`Pass Rate: ${summary.passRate}`);
      logger.info(`Total Duration: ${summary.duration}`);
      logger.info('=============================');

      // Save summary to file
      const summaryFile = path.join(ReportGenerator.reportsDir, 'summary.json');
      fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
      logger.info(`Summary saved: ${summaryFile}`);

    } catch (error) {
      logger.error('Failed to generate summary', { error });
    }
  }

  /**
   * Clean old reports
   */
  static cleanReports(): void {
    const patterns = ['*.html', '*.json', '*.xml'];
    
    patterns.forEach(pattern => {
      const files = fs.readdirSync(ReportGenerator.reportsDir)
        .filter(file => file.endsWith(pattern.replace('*', '')));
      
      files.forEach(file => {
        fs.unlinkSync(path.join(ReportGenerator.reportsDir, file));
      });
    });

    logger.info('Old reports cleaned');
  }

  /**
   * Archive reports by timestamp
   */
  static archiveReports(): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = path.join(ReportGenerator.reportsDir, 'archive', timestamp);

    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    const files = fs.readdirSync(ReportGenerator.reportsDir)
      .filter(file => file.endsWith('.html') || file.endsWith('.json') || file.endsWith('.xml'));

    files.forEach(file => {
      const srcPath = path.join(ReportGenerator.reportsDir, file);
      const destPath = path.join(archiveDir, file);
      fs.copyFileSync(srcPath, destPath);
    });

    logger.info(`Reports archived to: ${archiveDir}`);
  }
}

// Generate report if this file is executed directly
if (require.main === module) {
  ReportGenerator.generateHtmlReport();
  ReportGenerator.generateSummary();
}

export default ReportGenerator;
