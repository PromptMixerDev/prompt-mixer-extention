import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

// Create a custom globals object that includes Chrome API
const customGlobals = {
  ...globals.browser,
  chrome: 'readonly',
};

export default [
  { ignores: ['dist'] },
  // JavaScript/JSX configuration
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: customGlobals,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...prettier.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          tabWidth: 2,
          trailingComma: 'es5',
          printWidth: 100,
          bracketSpacing: true,
          arrowParens: 'avoid',
        },
      ],
    },
  },
  // TypeScript/TSX configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: customGlobals,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint,
      prettier: prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...prettier.configs.recommended.rules,
      'no-unused-vars': 'off', // Turned off in favor of TypeScript's version
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      '@typescript-eslint/no-explicit-any': 'off', // Allow 'any' type in TypeScript files
      camelcase: ['error', { properties: 'never' }], // Enforce camelCase for variables and functions
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'objectLiteralProperty',
          format: null, // Allow any format for object literal properties
          filter: {
            regex: '^(Content-Type|client_id|manifest_version|[A-Z][a-z]+(-[A-Z][a-z]+)+)$',
            match: true,
          },
        },
        {
          selector: 'typeProperty',
          format: null, // Allow any format for type properties
          filter: {
            regex: '^(client_id|manifest_version)$',
            match: true,
          },
        },
      ],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          tabWidth: 2,
          trailingComma: 'es5',
          printWidth: 100,
          bracketSpacing: true,
          arrowParens: 'avoid',
        },
      ],
    },
  },
  // Configuration for vite.config.ts
  {
    files: ['vite.config.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...customGlobals,
        __dirname: 'readonly', // Add __dirname for vite.config.ts
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.node.json', // Use tsconfig.node.json for vite.config.ts
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...prettier.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      'no-undef': 'off', // Turn off no-undef for vite.config.ts
      '@typescript-eslint/naming-convention': 'off', // Turn off naming convention for vite.config.ts
    },
  },
  // Apply prettier config to all files
  prettierConfig,
];
