import { defineConfig } from 'vitest/config';
export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: 'shared-util',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    watch: false,
  },
});
