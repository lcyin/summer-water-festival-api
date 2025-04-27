/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    setupFiles: ['<rootDir>/__tests__/setup.js'],
    testMatch: ['**/__tests__/**/*.test.js'],
    transformIgnorePatterns: ['node_modules/(?!(supertest)/)'],
    moduleFileExtensions: ['js', 'json', 'node'],
};

module.exports = config; 