# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-30

### Added

- Landing page completa com seções: Hero, Funcionalidades, Plataformas, Como Funciona, Sobre, FAQ, CTA
- Suporte a internacionalização (i18n) com PT-BR (padrão) e EN
- Seletor de idioma interativo no header
- Página de documentação (/docs)
- Formulário de contato via Web3Forms
- SEO: OpenGraph, Twitter Cards, meta tags dinâmicas
- Acessibilidade: WCAG AA, navegação por teclado, ARIA labels
- Design system com tokens SCSS (cores, tipografia, espaçamento)
- Responsivo: mobile-first com breakpoints alinhados ao Vuetify
- Build estático (SSG) via `nuxt generate`

### Technical

- Nuxt 4 + Vue 3 + TypeScript
- @nuxtjs/i18n v10
- @tabler/icons-webfont
- Vitest + Playwright para testes
- ESLint + Prettier + Husky + lint-staged
