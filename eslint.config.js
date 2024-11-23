import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { ignores: ["dist", "eslint.config.mjs"] },
  { languageOptions: { globals: globals.browser } },
  { plugins: { tseslint } },
  {
    rules: {
      "no-alert": "warn",
      "no-console": ["warn", { allow: ["error"] }],
      "no-constant-condition": "error",
      "no-debugger": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "use-isnan": "error",
      eqeqeq: ["error", "smart"],
      "no-eval": "error",
      "no-floating-decimal": "error",
      "no-new": "error",
      "no-return-assign": "error",
      "no-self-compare": "error",
      "no-undef-init": "error",
      "no-var": "error",
      "no-unused-vars": "error",
      "comma-dangle": ["error", "always-multiline"],
      "comma-spacing": ["error", { before: false, after: true }],
      "comma-style": ["error", "last"],
      "new-parens": "error",
      "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],
      quotes: ["error", "double", { avoidEscape: true }],
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
