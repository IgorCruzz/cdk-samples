module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/lambda/__test__"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
