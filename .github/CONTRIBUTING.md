# Contribuindo para o PIANO LouvorJA Site

Obrigado por querer contribuir! Este guia descreve o processo para enviar mudancas.

## Prerequisitos

- Node.js >= 24.18.0 (veja `.nvmrc`)
- pnpm >= 11.17.0
- Git configurado com sua chave SSH

## Setup do projeto

```bash
# Clone o repositorio
git clone git@github.com:pianolouvorja/site.git
cd site

# Instale as dependencias
pnpm install

# Inicie o servidor de desenvolvimento
pnpm dev
```

## Fluxo de trabalho (Git Flow)

1. **Branch base**: Todo trabalho parte de `staging` (nao de `main`)
2. **Nomenclatura de branch**:
   - `feature/descricao-curta` — novas funcionalidades
   - `fix/descricao-curta` — correcao de bugs
   - `chore/descricao-curta` — tarefas de manutencao
3. **Commits**: Use mensagens descritivas no imperativo (ex: "Adiciona secao de hero")
4. **PR target**: Sempre abra PR para `staging`

### Branches protegidas

- `main` — Producao. So recebe merge de `staging` via PR.
- `staging` — Homologacao. Recebe PRs de feature/fix.

## Padroes de codigo

### Antes de commit (pre-commit hook)

O hook Husky `pre-commit` executa automaticamente `lint-staged`, que roda:

- ESLint com `--fix` nos arquivos alterados
- Prettier para formatacao

### Antes de push (pre-push hook)

O hook `pre-push` executa:

- `pnpm typecheck` — verificacao de tipos TypeScript
- `pnpm test` — suite de testes unitarios

### Cobertura de testes

O projeto mantem **100% de cobertura** em todos os thresholds. Antes de abrir PR:

```bash
pnpm test:coverage
```

### Outros comandos uteis

```bash
pnpm lint          # Roda ESLint em todo o projeto
pnpm lint:fix      # Roda ESLint com --fix
pnpm format        # Formata com Prettier
pnpm format:check  # Verifica formatacao sem alterar (usado no CI)
pnpm typecheck     # Verifica tipos TypeScript
pnpm test:watch    # Testes em modo watch
pnpm test:e2e      # Testes E2E com Playwright
pnpm storybook     # Inicia o Storybook
```

## Padroes de design

- **Sem emojis nos icones**: Usar `@tabler/icons-webfont` com classes `ti ti-*`
- **Componentes The\***: Componentes canonicos sao data-driven via `~/data/site`
- **Responsividade**: Seguir as diretrizes em `CLAUDE.md` (useDisplay + @media)
- **Breakpoints**: Devem coincidir com Vuetify (sm=600, md=960, lg=1280, xl=1920)

## CI/CD

O CI (`.github/workflows/ci.yml`) executa em cada PR para `staging` e `main`:

- **Job quality**: lint, format check, typecheck, testes com cobertura
- **Job build**: build SSG (`nuxt generate`)

O PR so pode ser mergeado se ambos os jobs passarem.

## Reportando bugs ou sugerindo features

Use os templates de Issue em `.github/ISSUE_TEMPLATE/`.
