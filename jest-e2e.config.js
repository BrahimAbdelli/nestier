/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  testEnvironment: 'node',
  testTimeout: 60000,
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@shared/common/(.*)$': '<rootDir>/shared/common/$1',
    '^@faker-js/faker$': '<rootDir>/../node_modules/@faker-js/faker/dist/index.js'
  },
  collectCoverage: true,
  coveragePathIgnorePatterns: ['node_modules', '.mock.ts', 'e2e-spec.ts'],
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  rootDir: 'src',
  testRegex: '((\\.|/)(e2e\\.spec))\\.[jt]sx?$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@faker-js/faker)/)'
  ],
  coverageDirectory: '../coverage-e2e',
  verbose: false,
  cacheDirectory: '.jest-e2e-cache',
  bail: 0,
  maxConcurrency: 1,
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 30,
      lines: 50,
      statements: 50,
    },
  },
};
