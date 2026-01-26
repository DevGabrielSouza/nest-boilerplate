module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['apps/**/*.(t|j)s', '!apps/**/*.spec.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^apps/(.*)$': '<rootDir>/apps/$1',
    '^@env-config/(.*)$': '<rootDir>/libs/env-config/src/$1',
    '^@nc/(.*)$': '<rootDir>/libs/nc/src/$1',
  },
};
