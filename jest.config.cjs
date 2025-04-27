module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    setupFiles: ['dotenv/config'],
    testMatch: ['**/__tests__/**/*.test.js'],
    transformIgnorePatterns: ['node_modules/(?!(supertest)/)'],
    moduleFileExtensions: ['js', 'json', 'node'],
}; 