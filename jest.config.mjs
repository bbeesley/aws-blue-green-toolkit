import { defaults } from 'jest-config';

// eslint-disable-next-line import/no-default-export
export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/main/**/*'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  moduleFileExtensions: ['cjs', 'mjs', ...defaults.moduleFileExtensions],
  transformIgnorePatterns: ['/node_modules/.*\\.js$'],
  transform: { '\\.m?[jt]sx?$': 'babel-jest' },
  verbose: true,
};
