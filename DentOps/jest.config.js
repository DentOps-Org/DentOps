// Jest Configuration for DentOps Backend
module.exports = {
  // Test environment - Node.js
  testEnvironment: 'node',

  // Where to find test files
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.test.js'
  ],

  // Files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // Coverage settings (optional)
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js', // Exclude main server file
    '!src/config/**'   // Exclude config files
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true
};
