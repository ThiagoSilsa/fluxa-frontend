//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
  ...tanstackConfig,

  /*
    Formatação vira erro de ESLint, como no backend. Sem isto, arquivo fora do
    padrão é invisível enquanto se edita: entra na `main`, fica lá, e o próximo
    `npm run format` o arrasta para dentro de uma branch que não tem nada a ver
    com ele.

    Vem depois do `tanstackConfig` de propósito — desliga as regras de estilo
    dele que discordariam do prettier.
  */
  eslintPluginPrettierRecommended,

  {
    rules: {
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'pnpm/json-enforce-catalog': 'off',
      // `endOfLine: auto` para o checkout com CRLF não virar um erro por linha.
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
    },
  },

  {
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      'node_modules',
      'dist',
      'build',
      'coverage',
      '.tanstack',
      '.turbo',
      '.vite',
      'public',
      '.temp',
      '**/routeTree.gen.ts',
      'tailwind.config.js',
      'src/shared/components/ui/',
      '.github',
      'scripts',
    ],
  },
]
