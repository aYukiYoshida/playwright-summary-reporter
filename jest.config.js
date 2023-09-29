/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^summary-reporter$': '<rootDir>/src/index.ts',
  },
  testEnvironment: 'node',
  testMatch: ['**/tests/modules/*.(test|spec).ts'],
};