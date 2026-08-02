# Stage Local Status — pianolouvorja/site

> Snapshot do estado do código em `staging` no commit `2f13a66`.
> Documentado seguindo SDD + Project Excellence + OSS Excellence.

## Branch: staging @ 2f13a66

### Estado dos Testes (Local)

| Pirâmide    | Tool       | Arquivos | Testes  | Status   |
| ----------- | ---------- | -------- | ------- | -------- |
| Unit        | Vitest     | 14       | 159     | PASS     |
| Integration | Vitest     | 5        | 84      | PASS     |
| E2E         | Playwright | 4        | 82      | PASS     |
| **Total**   |            | **23**   | **325** | **PASS** |

### Quality Gates

| Gate      | Status                     |
| --------- | -------------------------- |
| Lint      | 0 errors (120 warnings)    |
| Typecheck | PASS                       |
| Format    | PASS                       |
| Coverage  | 100%                       |
| Mutation  | 100%                       |
| Storybook | 10 stories (10 components) |

### CI Status (Remoto)

| Run ID      | Workflow | Conclusão | Causa Raiz                   |
| ----------- | -------- | --------- | ---------------------------- |
| 30730041035 | CI       | FAILURE   | 3 jobs falharam (ver abaixo) |
| 30730041031 | Release  | FAILURE   | Branch protection em staging |

## Falhas de CI Diagnosticadas e Corrigidas

### F1: SonarQube Scan — `SONAR_TOKEN` ausente

**Sintoma:** `Failed to get server version` + `Running without SONAR_TOKEN`
**Causa raiz:** Secrets `SONAR_TOKEN` e/ou `SONAR_HOST_URL` não configurados no repo.
**Fix:** Step agora tem `if: ${{ env.SONAR_TOKEN != '' }}` — pula gracefully quando secret não existe. Action atualizada para v5.1.0.
**Arquivo:** `.github/workflows/ci.yml` linha 89-93

### F2: Playwright E2E — webServer não inicia

**Sintoma:** `Process from config.webServer was not able to start`
**Causa raiz:** `pnpm preview` (`nuxt preview`) exige build de produção prévio (`nuxt build`), mas o step não existia no job E2E.
**Fix:** Adicionado step `Build for E2E` (`pnpm build`) antes do `Install Playwright browsers`.
**Arquivo:** `.github/workflows/ci.yml` linhas 181-182

### F3: Semantic Release — Branch protection em staging

**Sintoma:** `GH006: Protected branch update failed for refs/heads/staging`
**Causa raiz:** `@semantic-release/git` tenta fazer `git push HEAD:staging` para salvar CHANGELOG.md/package.json, mas staging tem branch protection. O `GITHUB_TOKEN` padrão não tem bypass.
**Fix:** Workflow `release.yml` agora só roda em `push: branches: [main]`. Staging não dispara mais semantic-release. Releases (tags + changelog) acontecem no merge staging -> main.
**Arquivo:** `.github/workflows/release.yml` linha 5

## Versionamento (Semantic Release)

Estratégia: conventional commits -> semantic-release automático no merge para `main`.

| Branch  | Canal  | Tipo       | Version Format  |
| ------- | ------ | ---------- | --------------- |
| main    | latest | stable     | `v1.0.0`        |
| staging | beta   | prerelease | `v1.0.0-beta.1` |

Commit types e impacto de versionamento:

| Type         | Release |
| ------------ | ------- |
| feat         | minor   |
| fix          | patch   |
| perf         | patch   |
| revert       | patch   |
| refactor     | patch   |
| docs(README) | patch   |
| style        | none    |
| test         | none    |
| build        | none    |
| ci           | none    |
| chore        | none    |

## Stack

- Nuxt 4.5.1 + Vue 3.5.40 + TypeScript 5.9.2
- @nuxtjs/i18n (pt-BR / en / es)
- Vitest 3.2.7 (unit + integration) + Playwright 1.54.2 (E2E) + Stryker 9.6.1 (mutation)
- Storybook 8.6.14
- pnpm 11.17.0 / Node 24.18.0
- MIT License
