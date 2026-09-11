import nx from '@nx/eslint-plugin';
import { builtinModules } from 'node:module';
const noPlatformImports = [
  '@angular/*',
  '@nestjs/*',
  '@prisma/*',
  '@capacitor/*',
  'pg',
  'express',
  'node:*',
  ...builtinModules,
];
export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/src/generated/**',
      '**/.nx/**',
      '**/coverage/**',
    ],
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.{ts,tsx,js,jsx,mts,mjs,cjs}'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:web',
              onlyDependOnLibsWithTags: ['scope:web', 'scope:shared'],
              bannedExternalImports: [
                '@nestjs/*',
                '@prisma/*',
                'pg',
                'express',
                'node:*',
              ],
            },
            {
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: ['scope:api', 'scope:shared'],
              bannedExternalImports: ['@angular/*', '@capacitor/*'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
              bannedExternalImports: noPlatformImports,
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:data-access',
                'type:ui',
                'type:util',
                'type:contract',
              ],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:data-access',
                'type:ui',
                'type:util',
                'type:contract',
              ],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:util', 'type:contract'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: [
                'type:ui',
                'type:util',
                'type:contract',
              ],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util', 'type:contract'],
            },
            {
              sourceTag: 'type:contract',
              onlyDependOnLibsWithTags: ['type:contract'],
              allowedExternalImports: [],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['libs/shared/*/src/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '*',
                '!./*',
                '!../*',
                '!@spatial/contracts',
                '!@spatial/util',
              ],
              message:
                'Shared production code must remain framework and platform independent.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/src/**/*.ts', 'libs/web/**/*.ts'],
    ignores: ['apps/web/src/platform/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@nestjs/*',
                '@prisma/*',
                'pg',
                'express',
                'node:*',
                '@capacitor/*',
                ...builtinModules,
              ],
              message:
                'Platform integrations belong behind a reviewed native adapter boundary.',
            },
          ],
        },
      ],
    },
  },
];
