<script setup lang="ts">
  import { type TesterProfile } from '~/data/testers'
  import { useTestersRoster, useTestersReports } from '~/composables/useTesters'
  import type { TesterReport } from '~/utils/testers-sheet'

  const { t } = useI18n()

  useAppHead({
    title: t('testers.title'),
    description: t('testers.subtitle'),
  })

  const activeTester = ref<TesterProfile | null>(null)
  const activeSheetBio = ref('')

  function openTester(tester: TesterProfile, bio = ''): void {
    activeTester.value = tester
    activeSheetBio.value = bio
  }

  function closeTester(): void {
    activeTester.value = null
    activeSheetBio.value = ''
  }

  function onModalKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') closeTester()
  }

  const { testers, sheetBios } = useTestersRoster()

  const { positiveReports, enabled } = useTestersReports()

  const recentReports = computed<TesterReport[]>(() => (positiveReports.value ?? []).slice(0, 12))

  function statusIcon(status: TesterReport['status']): string {
    switch (status) {
      case 'ok':
        return 'ti ti-circle-check'
      case 'bug':
        return 'ti ti-bug'
      case 'feature':
        return 'ti ti-sparkles'
      default:
        return 'ti ti-message'
    }
  }
</script>

<template>
  <section class="testers">
    <div class="testers__container">
      <div class="testers__header">
        <span class="testers__eyebrow">{{ $t('testers.eyebrow') }}</span>
        <h1 class="testers__title">
          {{ $t('testers.title') }}
        </h1>
        <p class="testers__subtitle">
          {{ $t('testers.subtitle') }}
        </p>
      </div>

      <div class="testers__grid">
        <article v-for="tester in testers" :key="tester.id" class="testers__card">
          <img
            :src="tester.avatar"
            :alt="$t('testers.gallery.avatarAlt', { name: tester.name })"
            class="testers__avatar"
            width="72"
            height="72"
            loading="lazy"
          />
          <span class="testers__info">
            <span class="testers__name">{{ tester.name }}</span>
            <span class="testers__focus-list">
              <span v-for="focus in tester.focus" :key="focus" class="testers__chip">
                {{ $t(`testers.focus.${focus}`) }}
              </span>
            </span>
          </span>
          <button
            type="button"
            class="testers__more"
            :aria-label="$t('testers.gallery.more')"
            @click="openTester(tester, sheetBios[tester.id])"
          >
            {{ $t('testers.gallery.more') }}
            <i class="ti ti-arrow-right" aria-hidden="true" />
          </button>
        </article>
      </div>

      <div
        v-if="activeTester"
        class="testers-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="activeTester.name"
        @keydown="onModalKeydown"
      >
        <div class="testers-modal__overlay" @click="closeTester" />
        <div class="testers-modal__panel">
          <button
            type="button"
            class="testers-modal__close"
            :aria-label="$t('testers.modal.close')"
            @click="closeTester"
          >
            <i class="ti ti-x" aria-hidden="true" />
          </button>
          <img
            :src="activeTester.avatar"
            :alt="$t('testers.gallery.avatarAlt', { name: activeTester.name })"
            class="testers-modal__avatar"
            width="96"
            height="96"
          />
          <h2 class="testers-modal__name">
            {{ activeTester.name }}
          </h2>
          <p v-if="activeSheetBio" class="testers-modal__bio">
            {{ activeSheetBio }}
          </p>
          <p v-else class="testers-modal__bio">
            {{ $t(`testers.members.${activeTester.id}.bio`) }}
          </p>
          <div class="testers-modal__links">
            <a
              v-for="link in activeTester.links ?? []"
              :key="link.url"
              :href="link.url"
              class="testers-modal__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ link.label }}
            </a>
          </div>
        </div>
      </div>

      <div class="testers__cta">
        <div class="testers__cta-card">
          <i class="ti ti-user-plus" aria-hidden="true" />
          <div class="testers__cta-text">
            <strong>{{ $t('testers.cta.title') }}</strong>
            <p>{{ $t('testers.subtitle') }}</p>
          </div>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdQuprx1kijND4RBdrsFPh4dKDNtCxoaX7LwW7W2BkN-jHthw/viewform"
            target="_blank"
            rel="noopener noreferrer"
            class="testers__cta-button"
            data-testid="testers-join-btn"
          >
            {{ $t('testers.cta.button') }}
            <i class="ti ti-external-link" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div class="testers__reports">
        <h2 class="testers__reports-title">
          {{ $t('testers.reports.title') }}
        </h2>

        <p v-if="!enabled" class="testers__empty">
          {{ $t('testers.reports.comingSoon') }}
        </p>
        <p v-else-if="pending" class="testers__empty">
          {{ $t('testers.reports.loading') }}
        </p>
        <p v-else-if="!hasReports" class="testers__empty">
          {{ $t('testers.reports.empty') }}
        </p>

        <ul v-else class="testers__report-list">
          <li v-for="(report, i) in recentReports" :key="i" class="testers__report">
            <i :class="statusIcon(report.status)" aria-hidden="true" />
            <span class="testers__report-body">
              <span class="testers__report-meta">
                <strong>{{ report.tester || $t('testers.reports.anonymous') }}</strong>
                <span v-if="report.module">{{ report.module }}</span>
                <span v-if="report.version">v{{ report.version }}</span>
              </span>
              <span class="testers__report-text">{{ report.report }}</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .testers {
    padding: 6rem 1.5rem;
    background: var(--piano-white);

    &__container {
      max-width: 1100px;
      margin: 0 auto;
    }

    &__header {
      text-align: center;
      max-width: 720px;
      margin: 0 auto 3.5rem;
    }

    &__eyebrow {
      display: inline-block;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--piano-accent);
      margin-bottom: 0.75rem;
    }

    &__title {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 800;
      color: var(--piano-text-primary);
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    &__subtitle {
      font-size: 1.05rem;
      color: var(--piano-text-secondary);
      line-height: 1.7;
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    // ── CTA cadastro ─────────────────────────
    &__cta {
      margin-bottom: 3.5rem;
    }

    &__cta-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem 1.75rem;
      background: var(--piano-accent-soft);
      border: 1px solid var(--piano-accent);
      border-radius: 16px;

      i {
        font-size: 2.25rem;
        color: var(--piano-accent);
        flex-shrink: 0;
      }
    }

    &__cta-text {
      flex: 1;
      min-width: 0;

      strong {
        display: block;
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--piano-text-primary);
        margin-bottom: 0.25rem;
      }

      p {
        font-size: 0.95rem;
        color: var(--piano-text-secondary);
        line-height: 1.5;
      }
    }

    &__cta-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--piano-text-on-dark);
      background: var(--piano-accent);
      border-radius: 999px;
      text-decoration: none;
      white-space: nowrap;
      transition:
        background 0.2s,
        transform 0.1s;

      &:hover {
        background: var(--piano-accent-hover);
        transform: translateY(-1px);
      }
    }

    &__card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--piano-white);
      border: 1px solid var(--piano-gray-100);
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(10, 23, 51, 0.06);
    }

    &__avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    &__info {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      min-width: 0;
      flex: 1;
    }

    &__name {
      font-weight: 700;
      color: var(--piano-text-primary);
    }

    &__focus-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    &__chip {
      font-size: 0.75rem;
      padding: 0.15rem 0.6rem;
      border-radius: 999px;
      background: var(--piano-accent-soft);
      color: var(--piano-accent);
      font-weight: 600;
    }

    &__more {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: none;
      border: none;
      color: var(--piano-accent);
      font-weight: 600;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;

      &:hover {
        color: var(--piano-accent-hover);
      }
    }

    &__reports {
      margin-top: 1rem;
    }

    &__reports-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--piano-text-primary);
      margin-bottom: 1.25rem;
    }

    &__empty {
      color: var(--piano-text-secondary);
      text-align: center;
      padding: 2rem 1rem;
      background: var(--piano-gray-100);
      border-radius: 12px;
    }

    &__report-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 0.75rem;
    }

    &__report {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: var(--piano-white);
      border: 1px solid var(--piano-gray-100);
      border-radius: 12px;

      i {
        color: var(--piano-accent);
        font-size: 1.2rem;
        margin-top: 0.1rem;
      }
    }

    &__report-body {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }

    &__report-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--piano-text-secondary);

      strong {
        color: var(--piano-text-primary);
      }
    }

    &__report-text {
      color: var(--piano-text-secondary);
      line-height: 1.6;
    }
  }

  .testers-modal {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;

    &__overlay {
      position: absolute;
      inset: 0;
      background: rgba(10, 23, 51, 0.55);
    }

    &__panel {
      position: relative;
      background: var(--piano-white);
      border-radius: 16px;
      padding: 2.5rem 2rem 2rem;
      max-width: 420px;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    &__close {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--piano-text-secondary);
      font-size: 1.25rem;
      padding: 0.4rem;
      border-radius: 8px;

      &:hover {
        color: var(--piano-text-primary);
      }
    }

    &__avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      object-fit: cover;
    }

    &__name {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--piano-text-primary);
    }

    &__bio {
      color: var(--piano-text-secondary);
      line-height: 1.7;
    }

    &__links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
    }

    &__link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 0.9rem;
      border-radius: 999px;
      background: var(--piano-accent-soft);
      color: var(--piano-accent);
      font-weight: 600;
      text-decoration: none;
      font-size: 0.9rem;

      &:hover {
        color: var(--piano-accent-hover);
      }
    }
  }

  @media (max-width: 640px) {
    .testers {
      padding: 4rem 1rem;
    }
  }
</style>
