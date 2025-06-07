module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }]
  },
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/pages/(.*)$": "<rootDir>/pages/$1",
    "^@/utils/(.*)$": "<rootDir>/utils/$1",
    "^@/context/(.*)$": "<rootDir>/context/$1",
    "^@/hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    // Add direct mapping for lib/utils
    "^lib/utils$": "<rootDir>/__tests__/__mocks__/utils.js"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // Set transformIgnorePatterns to an empty array to ensure all node_modules are transformed
  transformIgnorePatterns: []
};