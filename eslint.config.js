import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    ignores: [
      '.nuxt/**',
      '.output/**',
      'dist/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'node_modules/**',
    ],
  },
  {
    files: ['**/*.vue', '**/*.ts'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
      globals: {
        // Nuxt auto-imports
        useI18n: 'readonly',
        useLocaleMessages: 'readonly',
        computed: 'readonly',
        ref: 'readonly',
        reactive: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        useHead: 'readonly',
        useSeoMeta: 'readonly',
        useAppHead: 'readonly',
        useRoute: 'readonly',
        useRouter: 'readonly',
        useRuntimeConfig: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        useState: 'readonly',
        useCookie: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
        clearError: 'readonly',
        createError: 'readonly',
        useNuxtApp: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        useAppConfig: 'readonly',
        // Browser DOM types
        MouseEvent: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        // Browser globals
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]
