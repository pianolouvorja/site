import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

const alias = {
  '~': fileURLToPath(new URL('./app', import.meta.url)),
  '@': fileURLToPath(new URL('./app', import.meta.url)),
}

export default defineConfig({
  test: {
    projects: [
      // Unit tests — DOM environment, mocked composables
      {
        plugins: [
          vue(),
          {
            name: 'mock-import-meta-unit',
            enforce: 'pre',
            transform(code, id) {
              // Replace import.meta.client/server in app source files
              if (id.includes('/app/') && (id.endsWith('.ts') || id.endsWith('.vue'))) {
                let transformed = code
                // Remove import.meta.server branches (always false in tests)
                transformed = transformed.replace(
                  /if\s*\(import\.meta\.server\)\s*\{[^}]*\}/g,
                  '/* server-only: removed in test */',
                )
                transformed = transformed.replace(
                  /if\s*\(import\.meta\.server\)\s*return/g,
                  '/* server-only: removed in test */',
                )
                // Keep import.meta.client branches (always true in tests)
                transformed = transformed.replace(
                  /if\s*\(import\.meta\.client\)\s*\{/g,
                  '{ /* client-only: always true in test */',
                )
                // Replace any remaining standalone references
                transformed = transformed.replace(/import\.meta\.client/g, 'true')
                transformed = transformed.replace(/import\.meta\.server/g, 'false')
                return {
                  code: transformed,
                  map: null as never,
                }
              }
            },
          },
        ],
        test: {
          globals: true,
          setupFiles: ['./test/setup.ts'],
          environment: 'happy-dom',
          include: ['test/**/*.test.ts'],
          exclude: ['test/integration/**'],
          name: 'unit',
        },
        resolve: { alias },
      },
      // Integration tests — node environment
      {
        plugins: [vue()],
        test: {
          globals: true,
          environment: 'node',
          include: ['test/integration/**/*.spec.ts'],
          name: 'integration',
        },
        resolve: { alias },
      },
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov', 'html'],
      all: true,
      include: ['app/**/*.{ts,vue}'],
      exclude: [
        'app/**/*.d.ts',
        'app/**/*.stories.ts',
        'app/app.vue',
        'app/layouts/*.vue',
        'app/pages/**/*.vue',
        'nuxt.config.ts',
        'vitest.config.ts',
        'husky.config.js',
      ],
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
    },
  },
})
