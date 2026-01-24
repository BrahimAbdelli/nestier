const sonarqubeScanner = require('sonarqube-scanner');

// SonarQube Scanner Configuration
const sonarConfig = {
  serverUrl: process.env.SONAR_HOST_URL || 'http://localhost:9000',
  token: process.env.SONAR_TOKEN,
  options: {
    'sonar.projectKey': 'nestier',
    'sonar.projectName': 'Nestier',
    'sonar.projectVersion': '2.0.1',
    'sonar.projectDescription': 'A NestJS boilerplate with clean architecture',
    'sonar.sources': 'src',
    'sonar.tests': 'src',
    'sonar.test.inclusions': '**/*.spec.ts,**/*.test.ts,**/*.e2e-spec.ts',
    'sonar.exclusions': '**/node_modules/**,**/dist/**,**/coverage/**,**/coverage-e2e/**,**/*.spec.ts,**/*.test.ts,**/*.e2e-spec.ts,**/*.mock.ts,**/test/**,**/tests/**',
    'sonar.cpd.exclusions': '**/*.spec.ts,**/*.test.ts,**/*.e2e-spec.ts,**/*.mock.ts',
    'sonar.typescript.tsconfigPath': 'tsconfig.json',
    'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info,coverage-e2e/lcov.info',
    'sonar.coverage.exclusions': '**/*.spec.ts,**/*.test.ts,**/*.e2e-spec.ts,**/*.mock.ts,**/test/**,**/tests/**',
    'sonar.typescript.eslint.reportPaths': 'eslint-report.json',
    'sonar.qualitygate.wait': 'true',
    'sonar.verbose': 'false',
    'sonar.sourceEncoding': 'UTF-8',
    'sonar.java.binaries': 'dist',
    'sonar.sonarscanner.mode': 'issues'
  }
};

// Run SonarQube Scanner
sonarqubeScanner(sonarConfig, (err) => {
  if (err) {
    console.error('SonarQube Scanner Error:', err);
    process.exit(1);
  }
  console.log('SonarQube analysis completed successfully');
});

