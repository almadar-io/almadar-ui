const almadarPlugin = require("@almadar/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
module.exports = [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { almadar: almadarPlugin },
    rules: {
      "almadar/no-unknown-type": "error",
      "almadar/no-record-string-unknown": "error",
    },
  },
];
