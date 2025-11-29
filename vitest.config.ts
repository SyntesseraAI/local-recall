import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Handle packages with incorrect main/exports like rake-pos
    alias: {
      'rake-pos': 'rake-pos/dist/src/index.js',
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/cli.ts'],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
