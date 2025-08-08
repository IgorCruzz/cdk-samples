module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/lambda/"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
