module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@faker-js/faker$': '<rootDir>/../node_modules/@faker-js/faker/dist/index.js',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@shared/common/(.*)$': '<rootDir>/shared/common/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@faker-js/faker)/)'
  ],
  collectCoverageFrom: [
    '**/*.(t|j)s'
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  testTimeout: 60000
};


