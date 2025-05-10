module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/lambda/test'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
