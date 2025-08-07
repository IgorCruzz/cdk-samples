module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/lambda/_tests"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
