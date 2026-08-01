# Fluxo de Homologação (Staging → Main)

## Visão Geral

```
feature/fix branches
        │
        ▼
   [PR → staging]     ← CI roda: lint, typecheck, test+coverage, build, mutation
        │
        ▼
    staging (beta)     ← Deploy automático para ambiente de homologação
        │
        ▼
   [PR → main]         ← Code review obrigatório, CI verde
        │
        ▼
     main (latest)     ← semantic-release tag + GitHub Release + deploy produção
```

## 1. Branches

| Branch    | Função          | Release Channel | Protection        |
| --------- | --------------- | --------------- | ----------------- |
| `main`    | Produção        | `latest`        | Estrita (ver §4)  |
| `staging` | Homologação/QA  | `beta`          | Moderada (ver §4) |
| `feat/*`  | Desenvolvimento | —               | Nenhuma           |
| `fix/*`   | Bugfixes        | —               | Nenhuma           |

## 2. Fluxo de Desenvolvimento

### 2.1 Feature → Staging

1. Criar branch a partir de staging:

   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feat/minha-feature
   ```

2. Desenvolver com commits convencionais:

   ```bash
   git commit -m "feat(player): adiciona suporte a playback offline"
   ```

3. Abrir PR para `staging`:

   ```bash
   gh pr create --base staging --head feat/minha-feature
   ```

4. CI roda automaticamente:
   - Lint + Format check
   - Typecheck
   - Test + Coverage (100% obrigatório)
   - SSG Build
   - Mutation testing (Stryker)

5. Após CI verde e review, fazer squash-merge para staging.

6. Push em `staging` dispara:
   - CI (push event)
   - semantic-release → tag beta (ex: `v1.1.0-beta.1`)

### 2.2 Staging → Main (Homologação)

1. Abrir PR de `staging` → `main`:

   ```bash
   gh pr create --base main --head staging --title "release: v1.x.x"
   ```

2. Workflow `homologation.yml` valida:
   - CI completo passa em staging
   - Build SSG funciona
   - Sem conflitos com main
   - Diff auditado (CHANGELOG gerado)

3. **Aprovação obrigatória** (mín. 1 reviewer).

4. Após aprovação, squash-merge para main.

5. Push em `main` dispara em cascata:
   - CI (push event)
   - semantic-release → tag latest + GitHub Release
   - deploy.yml → deploy para produção

## 3. Ambientes

| Ambiente | Branch  | URL (quando configurado)                |
| -------- | ------- | --------------------------------------- |
| Produção | main    | https://pianolouvorja.com               |
| Homolog  | staging | https://staging.pianolouvorja.com (TBD) |

## 4. Branch Protection Rules (Ezequias deve configurar)

### main (ESTRITA)

Settings → Branches → Add rule for `main`:

- [x] Require a pull request before merging
  - Required approvals: **1**
  - Dismiss stale approvals on new push: **Yes**
  - Require review from code owners: **Yes** (quando CODEOWNERS existir)
- [x] Require status checks to pass
  - Require branches to be up to date: **Yes**
  - Required checks: `Lint + Typecheck + Test`, `SSG Build`
- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings
- [x] Restrict who can push to matching branches (ninguém além de via PR)

### staging (MODERADA)

- [x] Require a pull request before merging
  - Required approvals: **1**
- [x] Require status checks to pass
  - Required checks: `Lint + Typecheck + Test`
- [x] Allow force pushes: **No**
- [x] Allow deletions: **No**

### Comando rápido (API)

```bash
# main - proteção estrita
gh api -X PUT repos/pianolouvorja/site/branches/main/protection \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  -f required_status_checks='{"strict":true,"contexts":["Lint + Typecheck + Test","SSG Build"]}' \
  -f enforce_admins=true \
  -f restrictions=null \
  -f required_linear_history=true

# staging - proteção moderada
gh api -X PUT repos/pianolouvorja/site/branches/staging/protection \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f required_status_checks='{"strict":true,"contexts":["Lint + Typecheck + Test"]}' \
  -f enforce_admins=false \
  -f restrictions=null
```

## 5. Secrets Necessários

Configurar em Settings → Secrets and variables → Actions:

| Secret                      | Uso                                      |
| --------------------------- | ---------------------------------------- |
| `SONAR_TOKEN`               | SonarQube analysis                       |
| `SONAR_HOST_URL`            | SonarQube server URL                     |
| `STRYKER_DASHBOARD_API_KEY` | Mutation testing dashboard               |
| `GH_RELEASE_TOKEN`          | semantic-release (fallback GITHUB_TOKEN) |
| `CF_API_TOKEN` _(futuro)_   | Deploy Cloudflare Pages                  |
| `CF_ACCOUNT_ID` _(futuro)_  | Deploy Cloudflare Pages                  |

## 6. Checklist de Release (Staging → Main)

Antes de abrir o PR de staging → main:

- [ ] Todas as features do ciclo estão mergeadas em staging
- [ ] CI passou em staging (ultimo commit verde)
- [ ] Version beta foi gerada (ex: `v1.2.0-beta.3`)
- [ ] Testes manuais realizados no ambiente de homologação
- [ ] Não há conflitos com main
- [ ] CHANGELOG.md reflete as mudanças (gerado por semantic-release)
- [ ] Sem secrets/credentials no código
- [ ] Breaking changes documentados no PR

## 7. Rollback

Se precisar reverter produção:

```bash
# Reverter para tag anterior
git revert <commit-hash> --no-edit
git push origin main

# Ou reverter release específica
gh release delete v1.x.x --yes
git tag -d v1.x.x
git push origin :refs/tags/v1.x.x
```

O semantic-release vai gerar uma nova tag de patch com o revert.
