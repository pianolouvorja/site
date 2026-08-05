# Contributing to PIANO LouvorJA

Obrigado por contribuir! Este documento descreve o processo de desenvolvimento.

## Pré-requisitos

- Node.js >= 24.18.0 (ver `.nvmrc`)
- pnpm >= 11.17.0
- Git

## Setup

```bash
git clone https://github.com/pianolouvorja/site.git
cd site
pnpm install
```

## Scripts disponíveis

| Script               | Descrição                         |
| -------------------- | --------------------------------- |
| `pnpm dev`           | Servidor de desenvolvimento       |
| `pnpm build`         | Build de produção                 |
| `pnpm generate`      | Geração estática (SSG)            |
| `pnpm test`          | Rodar testes unitários            |
| `pnpm test:coverage` | Testes com relatório de cobertura |
| `pnpm test:e2e`      | Testes E2E (Playwright)           |
| `pnpm test:mutation` | Mutation testing (Stryker)        |
| `pnpm typecheck`     | Verificação de tipos TypeScript   |
| `pnpm lint`          | ESLint                            |
| `pnpm format`        | Prettier format                   |

## Fluxo de Git

```
main (produção) ← staging (homologação) ← feature/* ← chore/*
```

1. **Nunca** commite diretamente em `main` ou `staging`
2. Crie uma branch a partir de `staging`: `git checkout -b feat/minha-feature`
3. Abra um PR para `staging`
4. Após merge e testes, `staging` → `main` via PR

## Conventional Commits

Usamos [Conventional Commits](https://conventionalcommits.org) — enforced pelo commitlint.

### Tipos permitidos

| Tipo       | Descrição               | Gera release?         |
| ---------- | ----------------------- | --------------------- |
| `feat`     | Nova funcionalidade     | minor                 |
| `fix`      | Correção de bug         | patch                 |
| `perf`     | Melhoria de performance | patch                 |
| `refactor` | Refatoração             | patch                 |
| `revert`   | Reverter commit         | patch                 |
| `docs`     | Documentação            | patch (escopo README) |
| `test`     | Testes                  | não                   |
| `style`    | Formatação/estilo       | não                   |
| `build`    | Sistema de build        | não                   |
| `ci`       | CI/CD                   | não                   |
| `chore`    | Manutenção              | não                   |

### Formato

```
type(scope): descrição em minúsculas e imperativa

<opcional corpo explicativo>

<opcional rodapé com BREAKING CHANGE ou closes #123>
```

### Exemplos

```
feat(i18n): adiciona seletor de idioma mobile
fix(seo): corrige meta tags para OpenGraph
docs(readme): atualiza instruções de deploy
test(composables): cobre branch null em useLocaleMessages
chore(deps): atualiza nuxt para 4.5.1
```

### Commits que pulam CI

Adicione `[skip ci]` no corpo do commit:

```
chore(release): v1.2.3 [skip ci]
```

## Qualidade

Mantemos estes padrões:

- **Coverage: 100%** — statements, branches, functions, lines
- **Mutation score: 100%** — Stryker
- **Lint: 0 erros** — warnings apenas para `no-explicit-any`
- **Typecheck: 0 erros**

## Releases

Releases são **automáticas** via [semantic-release](https://semantic-release.gitbook.io):

1. Commits em `staging` geram pré-releases (`vX.Y.Z-beta.N`)
2. Commits em `main` geram releases estáveis (`vX.Y.Z`)
3. CHANGELOG.md é atualizado automaticamente
4. GitHub Release é criado com notas

Não crie tags manualmente.

## Estrutura do projeto

```
app/
  components/    Componentes Vue
  composables/   Composables (lógica reutilizável)
  data/          Dados estáticos (site config, links)
  pages/         Páginas (file-based routing do Nuxt)
assets/
  css/           Estilos globais (SCSS)
  i18n/          Arquivos de tradução JSON
test/
  unit/          Testes unitários (Vitest)
  e2e/           Testes E2E (Playwright)
```

## Reportar bugs

Abra uma [issue](https://github.com/pianolouvorja/site/issues) com:

- Descrição do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
