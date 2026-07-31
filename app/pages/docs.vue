<script setup lang="ts">
  const { t } = useI18n()
  const { raw } = useLocaleMessages()

  // Module sections — maps to docs.sections.* i18n keys
  const moduleSections = [
    { id: 'media', icon: 'ti-music' },
    { id: 'hymnal', icon: 'ti-music-search' },
    { id: 'collections', icon: 'ti-playlist' },
    { id: 'liturgy', icon: 'ti-list-check' },
    { id: 'bible', icon: 'ti-book' },
    { id: 'projection', icon: 'ti-device-tv' },
    { id: 'streaming', icon: 'ti-broadcast' },
    { id: 'tools', icon: 'ti-tools' },
    { id: 'settings', icon: 'ti-adjustments' },
  ]

  // FAQ items — inline content keyed by docs.faq.*
  const faqItems = [
    { key: 'cost' },
    { key: 'offline' },
    { key: 'devices' },
    { key: 'data' },
    { key: 'privacy' },
    { key: 'support' },
    { key: 'updates' },
    { key: 'troubleshooting' },
    { key: 'contribute' },
  ]

  // Keyboard shortcuts from i18n (raw bypasses AST compilation)
  const shortcuts = computed(() => {
    const items = raw<Array<{ action: string; shortcut: string }>>('docs.content.shortcuts.items')
    return Array.isArray(items) ? items : []
  })

  // Getting started steps from i18n
  const gettingStartedSteps = computed(() => {
    const steps = raw<string[]>('docs.content.gettingStarted.steps')
    return Array.isArray(steps) ? steps : []
  })

  // Active section for sidebar highlight
  const activeSection = ref('gettingStarted')

  const scrollToSection = (id: string) => {
    activeSection.value = id
    const el = document.getElementById(`doc-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // SEO
  useAppHead({
    title: t('docs.title'),
    description: t('docs.subtitle'),
    path: '/docs',
  })
</script>

<template>
  <div class="docs-page">
    <!-- Hero -->
    <section class="docs-hero">
      <div class="docs-hero__container">
        <span class="docs-hero__eyebrow">{{ $t('nav.docs') }}</span>
        <h1 class="docs-hero__title">
          {{ $t('docs.title') }}
        </h1>
        <p class="docs-hero__subtitle">
          {{ $t('docs.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Main content with sidebar -->
    <div class="docs-layout">
      <!-- Sidebar navigation -->
      <aside class="docs-sidebar">
        <nav class="docs-sidebar__nav" :aria-label="$t('docs.sidebarLabel')">
          <button
            class="docs-sidebar__link"
            :class="{ 'docs-sidebar__link--active': activeSection === 'gettingStarted' }"
            data-testid="docs-nav-gettingStarted"
            @click="scrollToSection('gettingStarted')"
          >
            <i class="ti ti-rocket" />
            <span>{{ $t('docs.sections.gettingStarted.title') }}</span>
          </button>
          <button
            v-for="mod in moduleSections"
            :key="mod.id"
            class="docs-sidebar__link"
            :class="{ 'docs-sidebar__link--active': activeSection === mod.id }"
            :data-testid="`docs-nav-${mod.id}`"
            @click="scrollToSection(mod.id)"
          >
            <i :class="mod.icon" />
            <span>{{ $t(`docs.sections.${mod.id}.title`) }}</span>
          </button>
          <button
            class="docs-sidebar__link"
            :class="{ 'docs-sidebar__link--active': activeSection === 'shortcuts' }"
            data-testid="docs-nav-shortcuts"
            @click="scrollToSection('shortcuts')"
          >
            <i class="ti ti-keyboard" />
            <span>{{ $t('docs.sections.shortcuts.title') }}</span>
          </button>
          <button
            class="docs-sidebar__link"
            :class="{ 'docs-sidebar__link--active': activeSection === 'faq' }"
            data-testid="docs-nav-faq"
            @click="scrollToSection('faq')"
          >
            <i class="ti ti-help-circle" />
            <span>{{ $t('docs.sections.faq.title') }}</span>
          </button>
        </nav>
      </aside>

      <!-- Content area -->
      <main class="docs-content">
        <!-- Getting Started -->
        <section
          id="doc-gettingStarted"
          class="doc-section"
          data-testid="docs-section-gettingStarted"
        >
          <h2 class="doc-section__title">
            <i class="ti ti-rocket" />
            {{ $t('docs.sections.gettingStarted.title') }}
          </h2>
          <p class="doc-section__lead">
            {{ $t('docs.content.gettingStarted.intro') }}
          </p>
          <ol class="doc-steps">
            <li
              v-for="(step, idx) in gettingStartedSteps"
              :key="idx"
              class="doc-steps__item"
              :data-testid="`docs-step-${idx + 1}`"
            >
              <span class="doc-steps__number">{{ idx + 1 }}</span>
              <span class="doc-steps__text">{{ step }}</span>
            </li>
          </ol>
          <div class="doc-tip" data-testid="docs-tip">
            <i class="ti ti-bulb" />
            <p>{{ $t('docs.content.gettingStarted.tip') }}</p>
          </div>
        </section>

        <!-- Module sections -->
        <section
          v-for="mod in moduleSections"
          :id="`doc-${mod.id}`"
          :key="mod.id"
          class="doc-section"
          :data-testid="`docs-section-${mod.id}`"
        >
          <h2 class="doc-section__title">
            <i :class="mod.icon" />
            {{ $t(`docs.sections.${mod.id}.title`) }}
          </h2>
          <p class="doc-section__lead">
            {{ $t(`docs.sections.${mod.id}.description`) }}
          </p>
          <div class="doc-features">
            <div
              v-for="n in 3"
              :key="n"
              class="doc-feature-card"
              :data-testid="`docs-feature-${mod.id}-${n}`"
            >
              <i class="ti ti-check" />
              <span>{{ $t(`docs.content.modules.${mod.id}.${n - 1}`) }}</span>
            </div>
          </div>
        </section>

        <!-- Keyboard Shortcuts -->
        <section id="doc-shortcuts" class="doc-section" data-testid="docs-section-shortcuts">
          <h2 class="doc-section__title">
            <i class="ti ti-keyboard" />
            {{ $t('docs.sections.shortcuts.title') }}
          </h2>
          <p class="doc-section__lead">
            {{ $t('docs.sections.shortcuts.description') }}
          </p>
          <div class="doc-table-wrapper">
            <table class="doc-table" data-testid="docs-shortcuts-table">
              <thead>
                <tr>
                  <th>{{ $t('docs.content.shortcuts.table.action') }}</th>
                  <th>{{ $t('docs.content.shortcuts.table.shortcut') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in shortcuts"
                  :key="idx"
                  :data-testid="`docs-shortcut-${idx}`"
                >
                  <td>{{ item.action }}</td>
                  <td>
                    <kbd class="doc-kbd">{{ item.shortcut }}</kbd>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- FAQ -->
        <section id="doc-faq" class="doc-section" data-testid="docs-section-faq">
          <h2 class="doc-section__title">
            <i class="ti ti-help-circle" />
            {{ $t('docs.sections.faq.title') }}
          </h2>
          <div class="doc-faq">
            <details
              v-for="item in faqItems"
              :key="item.key"
              class="doc-faq__item"
              :data-testid="`docs-faq-${item.key}`"
            >
              <summary class="doc-faq__question">
                {{ $t(`docs.faq.${item.key}.question`) }}
                <i class="ti ti-chevron-down" />
              </summary>
              <div class="doc-faq__answer">
                {{ $t(`docs.faq.${item.key}.answer`) }}
              </div>
            </details>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .docs-page {
    min-height: 100vh;
  }

  // ── Hero ──────────────────────────────────────
  .docs-hero {
    background: var(--piano-bg-primary);
    padding: 5rem 1.5rem 4rem;
    text-align: center;

    &__container {
      max-width: 720px;
      margin: 0 auto;
    }

    &__eyebrow {
      display: inline-block;
      color: var(--piano-cyan-light);
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
    }

    &__title {
      font-size: 3rem;
      font-weight: 800;
      color: var(--piano-text-on-dark);
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    &__subtitle {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.7;
    }
  }

  // ── Layout: sidebar + content ─────────────────
  .docs-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 3rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 1.5rem 6rem;
  }

  // ── Sidebar ───────────────────────────────────
  .docs-sidebar {
    position: sticky;
    top: 100px;
    align-self: start;
    max-height: calc(100vh - 120px);
    overflow-y: auto;

    &__nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1rem 0;
      border-left: 2px solid var(--piano-gray-300);
    }

    &__link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1rem;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--piano-text-secondary);
      text-align: left;
      transition: all 0.2s;
      border-radius: 0 var(--piano-radius-sm) var(--piano-radius-sm) 0;

      i {
        font-size: 1.1rem;
        width: 20px;
        text-align: center;
        flex-shrink: 0;
      }

      &:hover {
        background: var(--piano-gray-100);
        color: var(--piano-blue);
      }

      &--active {
        background: var(--piano-gray-100);
        color: var(--piano-blue);
        font-weight: 700;
        border-left: 3px solid var(--piano-blue);
        margin-left: -2px;
      }
    }
  }

  // ── Content sections ──────────────────────────
  .docs-content {
    min-width: 0;
  }

  .doc-section {
    margin-bottom: 3.5rem;
    scroll-margin-top: 100px;

    &__title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--piano-text-primary);
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--piano-gray-100);

      i {
        color: var(--piano-blue);
        font-size: 1.4rem;
      }
    }

    &__lead {
      font-size: 1.05rem;
      color: var(--piano-text-secondary);
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }
  }

  // ── Getting Started steps ─────────────────────
  .doc-steps {
    list-style: none;
    counter-reset: steps;
    margin-bottom: 1.5rem;

    &__item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      margin-bottom: 0.75rem;
      background: var(--piano-gray-100);
      border-radius: var(--piano-radius-md);
    }

    &__number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--piano-radius-full);
      background: var(--piano-bg-accent);
      color: #fff;
      font-weight: 700;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    &__text {
      font-size: 1rem;
      color: var(--piano-text-primary);
      line-height: 1.6;
      padding-top: 0.3rem;
    }
  }

  // ── Tip box ───────────────────────────────────
  .doc-tip {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    background: rgba(0, 193, 230, 0.08);
    border-left: 4px solid var(--piano-cyan);
    border-radius: var(--piano-radius-md);

    i {
      color: var(--piano-cyan);
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    p {
      color: var(--piano-text-secondary);
      line-height: 1.6;
      padding-top: 0.15rem;
    }
  }

  // ── Feature mini-cards ────────────────────────
  .doc-features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .doc-feature-card {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 1rem 1.25rem;
    background: var(--piano-white);
    border: 1px solid var(--piano-gray-300);
    border-radius: var(--piano-radius-md);
    transition: border-color 0.2s;

    &:hover {
      border-color: var(--piano-cyan);
    }

    i {
      color: var(--piano-blue);
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    span {
      font-size: 0.95rem;
      color: var(--piano-text-secondary);
      font-weight: 500;
    }
  }

  // ── Shortcuts table ───────────────────────────
  .doc-table-wrapper {
    overflow-x: auto;
    border-radius: var(--piano-radius-md);
    border: 1px solid var(--piano-gray-300);
  }

  .doc-table {
    width: 100%;
    border-collapse: collapse;

    th {
      padding: 0.85rem 1.25rem;
      text-align: left;
      background: var(--piano-gray-100);
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--piano-text-secondary);
    }

    td {
      padding: 0.85rem 1.25rem;
      border-top: 1px solid var(--piano-gray-100);
      font-size: 0.95rem;
      color: var(--piano-text-primary);
    }

    tbody tr:hover {
      background: rgba(0, 193, 230, 0.04);
    }
  }

  .doc-kbd {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    background: var(--piano-dark);
    color: var(--piano-cyan-light);
    border-radius: var(--piano-radius-sm);
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.85rem;
    font-weight: 600;
  }

  // ── FAQ ───────────────────────────────────────
  .doc-faq {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    &__item {
      background: var(--piano-white);
      border: 1px solid var(--piano-gray-300);
      border-radius: var(--piano-radius-md);
      overflow: hidden;

      &[open] {
        border-color: var(--piano-blue);
      }
    }

    &__question {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      cursor: pointer;
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--piano-text-primary);
      list-style: none;

      &::-webkit-details-marker {
        display: none;
      }

      i {
        color: var(--piano-blue);
        transition: transform 0.2s;
        flex-shrink: 0;
      }

      .doc-faq__item[open] & {
        i {
          transform: rotate(180deg);
        }
      }
    }

    &__answer {
      padding: 0 1.25rem 1.25rem;
      color: var(--piano-text-secondary);
      line-height: 1.7;
      font-size: 0.95rem;
    }
  }

  // ── Responsive ────────────────────────────────
  @media (max-width: 960px) {
    .docs-layout {
      grid-template-columns: 1fr;
      gap: 0;
      padding-top: 2rem;
    }

    .docs-sidebar {
      position: static;
      max-height: none;
      margin-bottom: 1.5rem;

      &__nav {
        flex-direction: row;
        flex-wrap: wrap;
        border-left: none;
        border-bottom: 2px solid var(--piano-gray-300);
        padding: 0 0 1rem;
      }

      &__link {
        border-radius: var(--piano-radius-full);
        padding: 0.5rem 1rem;
        font-size: 0.85rem;

        &--active {
          border-left: none;
          margin-left: 0;
          background: var(--piano-bg-accent);
          color: #fff;
        }
      }
    }

    .doc-features {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .docs-hero {
      padding: 3.5rem 1.25rem 3rem;

      &__title {
        font-size: 2.2rem;
      }

      &__subtitle {
        font-size: 1.05rem;
      }
    }
  }
</style>
