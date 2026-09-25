# GAUNTLET-STATE — Sessão de Testadores (site)

Meta: Página /testers no pianolouvorja/site que faz fetch da Google Sheet do
Form de testadores e mantém a sessão sempre atualizada. PR base staging.

Branch: feat/testadores-sheet (worktree /tmp/site-testadores, base origin/staging)
Barra: B1..B7 congelada em Obsidian `04-Projects/LouvorJA PIANO/Sessão de Testadores — PLAN BARRA site.md`
Peças: P1 parse CSV (TDD) → P2 composable → P3 página → P4 i18n+footer → P5 smoke/typecheck/lint → PR

## Log de ciclos

- [P1] PASSOU — 10/10 testes (parse gviz, aliases, status). Commit ok.
  Lição: alias do vitest é `~/utils/...`; husky CRLF no worktree — usar git add -f se preciso.
- [P2] PASSOU (após debug) — 3/3 testes (load fetch, disabled, erro→[]).
  Causa raiz do teste vermelho: auto-import Nuxt (`parseTesterReports`)
  não existe fora do ambiente Nuxt — composable precisa import explícito
  de `~/utils/testers-sheet`. Registrado como pitfall.
- [P3+P4] PASSOU — página /testers (galeria+modal+relatos), nav/footer,
  i18n 3 idiomas via patch cirúrgico (Python json.dump reformatou o
  arquivo inteiro — regra: SEMPRE patch tool, nunca reescrever JSON).
  Teste nav atualizado (5 links). 927/927 GREEN. Build Nuxt ok. Commit fd6268c.
- [Rafael] Caique NÃO testa ativamente — fora da galeria nova (só quem testa de verdade).
- [Rafael] Ezequias já aprovou PRs do site (PR #51 admin-conteudo mergeada/fluxo
  andando) — nova PR pra esta feature, base staging, após rebase.

## Próximo comando

P5: smoke E2E da página /testers (mockando gviz) OU partir direto pra
rebase em staging + abrir PR. Decidir por custo/benefício: suíte unit+build
já verdes; PR pode ser aberta agora.

- [P2] PASSOU — 3/3 testes. Root cause do RED: auto-import de utils Nuxt não
  existe em vitest — import explícito `~/utils/testers-sheet` no composable.
  Commit ok.

## Próximo comando

P3: página app/pages/testers.vue (galeria estilo TeamSection: card + modal
com avatar/bio/links/foco) + seção de relatos da sheet + empty-state i18n.
