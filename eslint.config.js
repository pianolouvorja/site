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
      '.stryker-tmp/**',
      'reports/**',
      'dist/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'node_modules/**',
      'storybook-static/**',
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
        useLocalePath: 'readonly',
        computed: 'readonly',
        ref: 'readonly',
        reactive: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        onBeforeUnmount: 'readonly',
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        useHead: 'readonly',
        useSeoMeta: 'readonly',
        // Node.js
        process: 'readonly',
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
        useRequestHeaders: 'readonly',
        // Browser DOM types
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        IntersectionObserver: 'readonly',
        // Browser globals
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
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
