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
        plugins: [vue()],
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
      // Integration tests — node environment for real HTTP via @nuxt/test-utils
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
        'app/pages/*.vue',
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
