import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "public/app.js", "data/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["public/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },
    rules: {
      complexity: ["warn", 5],
      "max-lines-per-function": ["warn", 50]
    }
  }
];
