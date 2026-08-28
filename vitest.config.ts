import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

const alias = {
  '~': fileURLToPath(new URL('./app', import.meta.url)),
  '@': fileURLToPath(new URL('./app', import.meta.url)),
  '~~': fileURLToPath(new URL('.', import.meta.url)),
  '@@': fileURLToPath(new URL('.', import.meta.url)),
  h3: fileURLToPath(new URL('node_modules/h3/dist/index.mjs', import.meta.url)),
}

/**
 * Remove <style> dos SFCs nos testes unitários.
 * Evita deadlock do sass-embedded no pool do Vitest
 * (timeout em ?vue&type=style / "closed dispatcher").
 * Não usar no projeto integration — o Nuxt precisa dos estilos.
 */
function stripVueStyles(): Plugin {
  return {
    name: 'strip-vue-styles',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('.vue') || id.includes('?vue&type=')) return
      if (!/<style\b/i.test(code)) return
      return {
        code: code.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ''),
        map: null,
      }
    },
  }
}

function mockImportMetaUnit(): Plugin {
  return {
    name: 'mock-import-meta-unit',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('/app/') && (id.endsWith('.ts') || id.endsWith('.vue'))) {
        let transformed = code
        transformed = transformed.replace(
          /if\s*\(import\.meta\.server\)\s*\{[^}]*\}/g,
          '/* server-only: removed in test */',
        )
        transformed = transformed.replace(
          /if\s*\(import\.meta\.server\)\s*return/g,
          '/* server-only: removed in test */',
        )
        transformed = transformed.replace(
          /if\s*\(import\.meta\.client\)\s*\{/g,
          '{ /* client-only: always true in test */',
        )
        transformed = transformed.replace(/import\.meta\.client/g, 'true')
        transformed = transformed.replace(/import\.meta\.server/g, 'false')
        return {
          code: transformed,
          map: null as never,
        }
      }
    },
  }
}

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [stripVueStyles(), vue(), mockImportMetaUnit()],
        test: {
          globals: true,
          setupFiles: ['./test/setup.ts'],
          environment: 'happy-dom',
          include: ['test/**/*.test.ts'],
          exclude: ['test/integration/**'],
          name: 'unit',
          css: false,
        },
        resolve: { alias },
      },
      // Integration — Nuxt real; não stripar CSS / não forçar css:false
      {
        plugins: [vue()],
        test: {
          globals: true,
          environment: 'node',
          include: ['test/integration/**/*.spec.ts'],
          name: 'integration',
          fileParallelism: false,
          maxWorkers: 1,
          hookTimeout: 180_000,
        },
        resolve: { alias },
      },
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov', 'html'],
      all: true,
      include: [
        'app/**/*.{ts,vue}',
        'server/utils/email-brand.ts',
        'server/utils/email-i18n.ts',
        'server/utils/email-templates.ts',
        'server/utils/subscribers.ts',
        'server/utils/timeseries-buckets.ts',
        'server/utils/timeseries-align.ts',
        'server/utils/timeseries-sources.ts',
        'server/utils/webhook-signature.ts',
        'server/utils/llm-translate.ts',
        'server/utils/release-payload.ts',
        'server/api/newsletter/subscribe.post.ts',
      ],
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
