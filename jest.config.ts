import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  collectCoverage: true,
  verbose: true,
  coverageReporters: ['text', 'json', 'cobertura', 'lcov'],
  preset: 'ts-jest/presets/js-with-babel',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules"
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.sonarlint/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/.vscode/',
  ],
  globals: {
    'ts-jest': {
      useESM: true,
      diagnostics: {
        ignoreCodes: [
          2571,
          2532,
          2488,
          2322,
          2339,
          2345,
          6031,
          6133,
          7006,
          7053,
          18003,
          18048
        ],
      },
    },
  },
};

export default config;