import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'node:path';
export default defineConfig({
  root: import.meta.dirname,
  resolve: {
    alias: {
      '@spatial/contracts': resolve(
        import.meta.dirname,
        '../../libs/shared/contracts/src/index.ts',
      ),
      '@spatial/util': resolve(
        import.meta.dirname,
        '../../libs/shared/util/src/index.ts',
      ),
    },
  },
  plugins: [
    swc.vite({
      tsconfigFile: resolve(import.meta.dirname, 'tsconfig.app.json'),
      jsc: { transform: { decoratorMetadata: true, legacyDecorator: true } },
      module: { type: 'es6' },
    }),
  ],
  test: {
    name: 'api',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: { reportsDirectory: '../../coverage/apps/api', provider: 'v8' },
  },
});
