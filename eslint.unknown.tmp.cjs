"use strict";
const tsParser = require("@typescript-eslint/parser");
const almadarPlugin = require("@almadar/eslint-plugin");

module.exports = [
  { ignores: ["dist/**", "node_modules/**", "**/*.stories.tsx", "**/*.test.tsx", "**/*.test.ts"] },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: { almadar: almadarPlugin },
    rules: {
      "almadar/no-unknown-type": "error",
      "almadar/no-record-string-unknown": "error",
    },
  },
];
