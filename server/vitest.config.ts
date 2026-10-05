import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts', '**/*-spec.ts'],
    fileParallelism: false,
    maxWorkers: 1,
    hookTimeout: 30000,
  },
});
