import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/features/**/*.ts',
        'src/shared/lib/errors.ts',
        'src/shared/lib/api-error-handler.ts',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/test-helpers/**',
        '**/test-mocks/**',
        'src/features/**/infrastructure/mappers/**',
        'src/features/**/infrastructure/drizzle-repositories/**',
        'src/features/**/infrastructure/presenters/**',
        'src/features/**/application/factories/**',
        'src/features/**/application/dto/**',
        'src/features/**/domain/repositories/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
