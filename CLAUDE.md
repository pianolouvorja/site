# PIANO LouvorJA Site — Development Guide

## Stack

- **Framework**: Nuxt 4 SSG (Vue 3 + Vue Router)
- **Language**: TypeScript strict
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Coverage**: 100% em todos os thresholds (lines, functions, branches, statements)
- **Pre-commit**: Husky + lint-staged
- **Package Manager**: pnpm

## Responsive Design Pattern

Este projeto usa dois pares complementares para responsividade:

### 1. `useDisplay` ou composables — para lógica JS/template

```vue
<script setup lang="ts">
  const isMobile = ref(false)

  onMounted(() => {
    isMobile.value = window.innerWidth < 768
  })
</script>
```

### 2. `@media` queries (CSS) — para mudanças visuais

```scss
.component {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 430px) {
    font-size: 0.875rem;
  }
}
```

### Breakpoints padrão

| Token  | Value  | Uso              |
| ------ | ------ | ---------------- |
| mobile | 430px  | Mobile pequeno   |
| sm     | 600px  | Mobile → tablet  |
| md     | 768px  | Tablet → desktop |
| lg     | 1280px | Desktop → large  |

## TDD Workflow

**RED → GREEN → REFACTOR**

1. Escrever o teste primeiro (arquivo `*.test.ts` ou `*.spec.ts`)
2. Rodar `pnpm test` — teste deve FALHAR (RED)
3. Implementar o mínimo de código para o teste passar (GREEN)
4. Refatorar mantendo os testes verdes (REFACTOR)
5. Repetir

### Comandos

```bash
pnpm test           # Roda testes unitários uma vez
pnpm test:watch     # Modo watch
pnpm test:coverage  # Gera relatório de cobertura
pnpm test:e2e       # Roda testes E2E (Playwright)
pnpm test:all       # Tudo: unit + coverage + e2e
pnpm typecheck      # Verificação de tipos
pnpm build          # Build de produção (SSG)
```

### Cobertura

A cobertura mínima é **100%** em todos os thresholds. O CI vai falhar se qualquer
metrica cair abaixo. Testes sem coverage de uma linha, branch ou função = bloqueado.

## Estrutura de Pastas

```
app/
  components/     # Componentes Vue (atomic design)
  composables/    # Composables reutilizáveis
  pages/          # Páginas/routing
  assets/         # CSS, imagens
test/
  unit/           # Testes unitários
  setup.ts        # Setup global do Vitest
e2e/              # Testes E2E (Playwright)
```

## Commits e Branches

- **Branch padrão**: `main` (protegida)
- **Fluxo**: feature branch → PR → review → merge
- **Pre-commit hook**: roda lint-staged (eslint + typecheck nos arquivos alterados)
- **Commit message**: convencional (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`)
