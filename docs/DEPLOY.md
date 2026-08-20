# Deploy — PIANO Site (landing)

Fluxo Git + CI para publicar o site em **homologação (`staging`)** e **produção (`main`)**. O GitHub Actions **valida** (lint, format, types, testes, SSG, e2e, Storybook, Lighthouse). O **deploy** de produção é o workflow **Deploy** (gera o estático em `.output/public/`); a hospedagem ainda precisa estar ligada nesse artefato.

Repo: `github.com/pianolouvorja/site`  
Pacote: `piano-louvorja-site`  
Gerenciador: **pnpm** (não usar `npm` / `npm ci`)

A GitHub Release deste repo publica **somente as release notes** (e o changelog no Git). **Não** anexe assets/binários aqui — instaladores pertencem ao fluxo do app desktop (`pianolouvorja/app`). O site é SSG (Nuxt `generate`).

## Regras de branch (obrigatório)

| Branch                                 | Quem pode atualizar                      | Como                                  |
| -------------------------------------- | ---------------------------------------- | ------------------------------------- |
| `feat/*`, `fix/*`, `chore/*`, `docs/*` | Direto (push)                            | Trabalho diário                       |
| `staging`                              | **Somente via PR**                       | Feature e consolidação para homologar |
| `main`                                 | **Somente via PR a partir de `staging`** | Release de produção                   |

- Nunca commit/push direto em `staging` ou `main` (rulesets bloqueiam merge direto).
- `main` **só** recebe PR com origem `staging` (workflow `protect-main-source.yml` + job em `homologation.yml`).
- Features novas nunca vão direto para `main`.

## Ambientes

| Branch    | Ambiente    | URL                                                                                                                                            |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `staging` | Homologação | Branch Git + CI. Valide localmente com `pnpm generate` + `pnpm preview` (URL pública de staging do site ainda não está documentada no deploy). |
| `main`    | Produção    | https://pianolouvorja.com.br                                                                                                                   |

Workflows:

| Workflow                            | Quando                              | O que faz                                                                                                               |
| ----------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **CI** (`.github/workflows/ci.yml`) | PR e push em `staging`/`main`       | Quality (lint, format, typecheck, coverage), Sonar, SSG (`pnpm generate`), mutation (só PR), e2e, Storybook, Lighthouse |
| **Protect main source**             | PR para `main`                      | Falha se a origem não for `staging`                                                                                     |
| **Homologation**                    | PR para `main`                      | Revalida lint/coverage/build e confirma origem `staging`                                                                |
| **Release**                         | Push em `main`                      | `semantic-release`: tag `vX.Y.Z`, `CHANGELOG.md`, GitHub Release                                                        |
| **Deploy**                          | Push em `main` ou release publicada | `pnpm generate` + artifact `production-build` (`.output/public/`)                                                       |

O alvo de hospedagem no **Deploy** ainda está como TODO no workflow (Cloudflare / Vercel / Pages / VPS). Até ligar, o merge na `main` **não** publica sozinho o site ao vivo — só gera o artefato e dispara o release.

## Fluxo correto (obrigatório)

```text
feat/* ou fix/*
    →  valida local (lint + test + generate + preview)
    →  PR → staging
    →  CI verde + merge (somente PR)
    →  valida homologação
    →  PR staging → main
    →  CI + Validate PR source branch + Homologation
    →  merge (somente PR)
    →  semantic-release (tag + notes) + Deploy (SSG)
    →  produção
```

1. Trabalhe sempre em uma **branch de atuação** (`feat/...`, `fix/...`), criada a partir da `staging` atualizada. Nunca commit direto em `staging` ou `main`.
2. **Antes de abrir (ou de mergear) a PR**, valide localmente: baixe a branch/PR, rode qualidade + SSG e teste no preview.
3. Abra PR da branch de atuação **para `staging`**.
4. Merge **só** com CI verde. Isso **não** é push na `staging`.
5. Valide o pacote homologado (preview local a partir de `origin/staging`, e as páginas principais / i18n / download).
6. Só então abra PR **`staging` → `main`** (nunca `feat` → `main`).
7. Merge só com CI + **Validate PR source branch** + **Homologation** verdes.
8. O push na `main` dispara **Release** (versão + notes) e **Deploy** (generate).
9. Confirme https://pianolouvorja.com.br (e o artefato nas Actions, se a hospedagem ainda não estiver ligada).

Não faça PR de feature direto na `main`. Produção só recebe o que já passou pela `staging`.

## Onde entra o versionamento

Este repo **não** usa `npm run version:bug` como o web. A versão sai do **Semantic Release** a partir dos [Conventional Commits](https://www.conventionalcommits.org/) já mergeados.

O bump **não** acontece em cada `feat`/`fix`. Ele marca o **release**: o pacote que já passou pela `staging` e foi mergeado na `main`.

```text
trabalho diário          validação              release
───────────────          ─────────              ───────
feat/fix → PR → staging  →  staging ok  →  PR staging → main  →  semantic-release
```

| Momento               | Versiona?                  | Release notes?              | Por quê                                                      |
| --------------------- | -------------------------- | --------------------------- | ------------------------------------------------------------ |
| Branch `feat`/`fix`   | Não                        | Não                         | Ainda é trabalho em andamento                                |
| Merge na `staging`    | Não                        | Não                         | Só homologa (CI). `release.yml` **não** roda na `staging`    |
| PR `staging` → `main` | Não ainda                  | Não ainda                   | Homologation / CI / origem                                   |
| Merge na `main`       | **Sim** (semantic-release) | **Sim** (automático na tag) | Tag `vX.Y.Z`, `package.json`, `CHANGELOG.md`, GitHub Release |
| Produção validada     | Não                        | Ajuste se preciso           | Edite as notes se o texto automático estiver ruim            |

Não faça bump manual com `pnpm version` / `npm version` nem push de tag na `staging`: a `staging` é protegida e o `semantic-release` na `main` é a fonte da versão.

O commit que o release cria (`chore(release): … [skip ci]`) usa `GH_RELEASE_TOKEN` para conseguir escrever na `main` sem furar o fluxo de PR das features.

### Qual tipo de bump

Definido pelos commits do ciclo (veja `CONTRIBUTING.md` e `.releaserc.json`):

| Situação                           | Tipo de commit                     | Resultado (SemVer)        |
| ---------------------------------- | ---------------------------------- | ------------------------- |
| Correção / ajuste pequeno          | `fix:` / `perf:` / `refactor:`     | patch (`1.0.0` → `1.0.1`) |
| Nova funcionalidade compatível     | `feat:`                            | minor (`1.0.0` → `1.1.0`) |
| Quebra de compatibilidade          | `BREAKING CHANGE:` no corpo/rodapé | major (`1.0.0` → `2.0.0`) |
| `chore:`, `test:`, `ci:`, `style:` | —                                  | não gera release          |

## Onde entram as release notes

A tag Git (`vX.Y.Z`) e o **GitHub Release** nascem no **semantic-release**, no merge da `main`.

**Site:** Release = notes (+ changelog no Git). Sem `gh release upload` / zip de `.output` / instaladores neste repo.

Se quiser notes mais claras para o público **depois** da produção ok:

```bash
gh release edit v1.1.0 --notes "$(cat <<'EOF'
## Destaques
- O que o visitante / equipe precisa saber nesta versão

EOF
)"
```

---

## Exemplo completo (comandos)

Cenário: correção ou feature qualquer. Raiz do repo:

```bash
cd /home/Arquivos/AmbienteDev/Projetos/Web/LouvorJA/StackVue/site
```

### 1. Atualizar a `staging` e criar a branch de atuação

```bash
git fetch origin
git switch staging
git pull origin staging

git switch -c feat/minha-alteracao
```

`git pull` na `staging` só atualiza o clone; **não** substitui o merge por PR no GitHub.

### 2. Fazer as alterações, commit e push

Conventional Commits (commitlint / husky):

```bash
# ... edite os arquivos ...

git add .
git commit -m "$(cat <<'EOF'
feat: descreva o motivo da alteração

EOF
)"

git push -u origin HEAD
```

### 3. Validar localmente (branch de trabalho ou PR)

Faça isso **ainda na branch de atuação**, antes de mergear na `staging`.

#### Opção A — você é o autor (já está na `feat/...`)

```bash
git switch feat/minha-alteracao
git pull origin feat/minha-alteracao

pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm generate
pnpm preview
```

Abra o endereço que o Nuxt mostrar (em geral `http://localhost:3000`) e teste o fluxo da alteração (home, i18n `/en` `/es`, download, rotas legais).

Para desenvolver com hot-reload em vez do SSG:

```bash
pnpm dev
```

#### Opção B — baixar uma PR de outra pessoa (ou a sua já aberta)

```bash
git fetch origin

# troque 42 pelo número da PR no GitHub
gh pr checkout 42

pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm generate
pnpm preview
```

Se preferir sem `gh`:

```bash
git fetch origin pull/42/head:pr-42
git switch pr-42

pnpm install --frozen-lockfile
pnpm generate
pnpm preview
```

Só depois dessa validação local siga para abrir a PR (se ainda não abriu) ou para o merge na `staging`.

### 4. Abrir PR para `staging`

```bash
gh pr create --base staging --title "feat: descreva o motivo da alteração" --body "$(cat <<'EOF'
## Summary
- O que mudou e por quê

## Test plan
- [ ] Validado localmente (`pnpm lint` / `typecheck` / `test:coverage` / `generate` + `preview`)
- [ ] CI passou (quality, SSG, e2e)
- [ ] Após merge, comportamento ok a partir de `origin/staging`
- [ ] Locales pt-BR / en / es não quebram

EOF
)"
```

Se o `gh` falhar com `must be a collaborator`, abra no navegador:

`https://github.com/pianolouvorja/site/compare/staging...feat/minha-alteracao`

### 5. Mergear a PR → `staging`

1. No GitHub, revise e faça **Merge** da PR na `staging` (somente com validação local + CI ok). **Não** dê push direto na `staging`.
2. Em **Actions**, acompanhe o workflow **CI**.
3. Atualize o clone e revalide o SSG a partir da `staging` remota:

```bash
git fetch origin
git switch staging
git pull origin staging

pnpm install --frozen-lockfile
pnpm generate
pnpm preview
```

Checklist rápido no preview:

- home carrega
- `/en` e `/es` carregam
- `/download` e `/releases` (se tocadas) ok
- páginas legais (`/privacy`, `/terms`) ok

A branch `feat/minha-alteracao` pode ser apagada depois do merge.

### 6. Abrir PR `staging` → `main` (produção)

Só com a `staging` validada. **Não** abra PR de `feat/*` para `main` — o job **Validate PR source branch** falha.

```bash
git fetch origin

gh pr create --base main --head staging --title "release: promover staging" --body "$(cat <<'EOF'
## Summary
- Promove o que já está validado na staging para produção
- Versionamento e notes ficam a cargo do semantic-release no merge da main

## Test plan
- [ ] Staging validada (preview a partir de origin/staging)
- [ ] CI verde nesta PR
- [ ] Validate PR source branch (origem = staging) passou
- [ ] Homologation passou
- [ ] Após merge: Release + Deploy ok
- [ ] https://pianolouvorja.com.br carrega (quando a hospedagem estiver ligada)

EOF
)"
```

Alternativa no navegador:

`https://github.com/pianolouvorja/site/compare/main...staging`

### 7. Mergear → produção

1. **Merge** da PR na `main` (CI + origem `staging` + Homologation verdes). **Não** dê push direto na `main`.
2. Acompanhe **Release** e **Deploy** em Actions.
3. Valide: https://pianolouvorja.com.br (e o artifact `production-build` se o publish automático ainda não estiver configurado).

### 8. Conferir a GitHub Release

A tag e as notes vêm do semantic-release. Confira:

https://github.com/pianolouvorja/site/releases

Ajuste as notes com `gh release edit` se o texto gerado não estiver claro. **Não** anexe binários.

### 9. Atualizar a `main` local (opcional)

O semantic-release pode ter commitido `CHANGELOG.md` / `package.json` na `main`:

```bash
git fetch origin
git switch main
git pull origin main
git switch staging
```

Se a `staging` ficar atrás desses arquivos de release, abra um PR **`main` → `staging`** (ou cherry-pick) — **não** faça push direto na `staging` para sincronizar.

---

## Checklist rápido

- [ ] Branch de atuação criada a partir da `staging` atualizada
- [ ] Validado localmente (`pnpm install --frozen-lockfile` + lint + typecheck + `test:coverage` + `generate` + `preview`)
- [ ] PR → `staging` (nunca feature direto na `main`; nunca push direto na `staging`)
- [ ] CI verde
- [ ] Homologação testada no preview
- [ ] PR `staging` → `main` (origem obrigatoriamente `staging`)
- [ ] Validate PR source branch + Homologation + CI verdes
- [ ] Release (tag + notes) e Deploy (SSG) ok
- [ ] Produção ok em https://pianolouvorja.com.br (quando a hospedagem estiver ligada)
- [ ] GitHub Release conferida (**notes apenas**, sem assets)

## Problemas comuns

| Sintoma                                               | Causa provável                            | O que fazer                                                                                                  |
| ----------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Push rejeitado em `staging`/`main`                    | Branch protegida                          | Use PR. Nunca `git push origin staging` / `main` com feature ou bump                                         |
| PR para `main` falha em **Validate PR source branch** | Origem não é `staging`                    | Feche a PR e abra `staging` → `main`                                                                         |
| CI falha em quality                                   | Lint, format, types ou coverage &lt; 100% | Ver log do job em **Actions → CI**                                                                           |
| CI falha no SSG                                       | `pnpm generate` quebrou                   | Rodar localmente; conferir `GITHUB_TOKEN` só se a falha for API GitHub no generate                           |
| `pnpm install --frozen-lockfile` falha                | `package.json` ≠ `pnpm-lock.yaml`         | `pnpm install` e commitar o lockfile                                                                         |
| Semantic-release não cria versão                      | Só commits `chore`/`test`/`ci` no ciclo   | Inclua `feat`/`fix` (ou `BREAKING CHANGE`) no que foi para a `main`                                          |
| `chore(release)` não entra na `main`                  | Token sem bypass do ruleset               | Conferir secret `GH_RELEASE_TOKEN`                                                                           |
| Site de produção desatualizado                        | Deploy ainda sem alvo de hospedagem       | Baixar artifact `production-build` nas Actions e publicar na hospedagem; ou completar o TODO em `deploy.yml` |
| `gh pr create` → must be a collaborator               | Conta `gh` sem permissão no repo          | Trocar conta (`gh auth switch`) ou abrir PR no navegador                                                     |

## Arquivos relacionados

- `.github/workflows/ci.yml` — CI (quality, Sonar, SSG, mutation, e2e, Storybook, Lighthouse)
- `.github/workflows/protect-main-source.yml` — PRs para `main` só de `staging`
- `.github/workflows/homologation.yml` — revalidação no PR `staging` → `main`
- `.github/workflows/release.yml` — semantic-release na `main`
- `.github/workflows/deploy.yml` — generate + artifact de produção
- `.releaserc.json` — regras SemVer / changelog / GitHub Release
- `CONTRIBUTING.md` — Conventional Commits
- `nuxt.config.ts` — SSG / i18n / prerender
