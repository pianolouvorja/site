<script setup lang="ts">
  const { t } = useI18n()

  // SEO
  useHead({
    title: () => `${t('conduct.title')} — PIANO LouvorJA`,
    meta: [
      { name: 'description', content: () => t('conduct.metaDescription') },
      { name: 'robots', content: 'index, follow' },
    ],
  })

  // Sections keyed by conduct.sections.*
  const sections = [
    { id: 'celebrate', icon: 'ti-heart' },
    { id: 'notAllowed', icon: 'ti-alert-triangle' },
    { id: 'moderation', icon: 'ti-flag' },
    { id: 'gameMasters', icon: 'ti-users' },
    { id: 'transparency', icon: 'ti-eye' },
    { id: 'invitation', icon: 'ti-music' },
  ]
</script>

<template>
  <div class="legal-page">
    <div class="legal-page__container">
      <header class="legal-page__header">
        <h1 class="legal-page__title">
          {{ $t('conduct.title') }}
        </h1>
        <p class="legal-page__updated">
          {{ $t('conduct.lastUpdated') }}
        </p>
      </header>

      <div class="legal-page__intro">
        <p>{{ $t('conduct.intro') }}</p>
        <blockquote class="legal-page__quote">
          {{ $t('conduct.purposeQuote') }}
        </blockquote>
      </div>

      <nav class="legal-page__toc" :aria-label="$t('conduct.tocLabel')">
        <ul>
          <li v-for="section in sections" :key="section.id">
            <a :href="`#${section.id}`">
              {{ $t(`conduct.sections.${section.id}.title`) }}
            </a>
          </li>
        </ul>
      </nav>

      <section
        v-for="section in sections"
        :id="section.id"
        :key="section.id"
        class="legal-page__section"
      >
        <h2>
          <i :class="`ti ${section.icon}`" aria-hidden="true" />
          {{ $t(`conduct.sections.${section.id}.title`) }}
        </h2>
        <p
          v-for="(paragraph, index) in $tm(`conduct.sections.${section.id}.body`) as string[]"
          :key="index"
        >
          {{ paragraph }}
        </p>
        <blockquote v-if="section.id === 'invitation'" class="legal-page__quote">
          {{ $t('conduct.sections.invitation.quote') }}
        </blockquote>
      </section>
    </div>
  </div>
</template>
<style scoped lang="scss">
  .legal-page {
    background: var(--piano-bg-primary);
    color: var(--piano-text-primary);
    min-height: 100vh;
    padding: 0 1.5rem 4rem;

    &__container {
      max-width: 800px;
      margin: 0 auto;
    }

    &__header {
      text-align: center;
      margin-bottom: 3rem;
    }

    &__title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--piano-text-primary);
      margin: 0 0 0.5rem;
    }

    &__updated {
      font-size: 0.9rem;
      color: var(--piano-text-muted);
      margin: 0;
    }

    &__intro {
      background: var(--piano-accent-soft);
      border-radius: var(--piano-radius-md);
      padding: 1.5rem;
      margin-bottom: 3rem;
      border-left: 4px solid var(--piano-accent);
    }

    &__toc {
      background: var(--piano-bg-secondary);
      border-radius: var(--piano-radius-md);
      padding: 1.5rem;
      margin-bottom: 3rem;

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.5rem;
      }

      a {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--piano-text-secondary);
        text-decoration: none;
        font-size: 0.9rem;
        padding: 0.5rem;
        border-radius: var(--piano-radius-sm);
        transition: all 0.2s;

        &:hover {
          background: var(--piano-accent-soft);
          color: var(--piano-accent);
        }

        i {
          font-size: 1rem;
          color: var(--piano-accent);
        }
      }
    }

    &__section {
      margin-bottom: 3rem;

      &:target {
        scroll-margin-top: 2rem;
      }
    }

    &__section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--piano-text-primary);
      margin: 0 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--piano-border-subtle);
    }

    &__section-body {
      font-size: 0.95rem;
      line-height: 1.7;
      color: var(--piano-text-secondary);

      p {
        margin: 0 0 0.75rem;
      }

      a {
        color: var(--piano-accent);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    @media (max-width: 600px) {
      padding: 0 1rem 2rem;

      &__title {
        font-size: 1.75rem;
      }

      &__toc ul {
        grid-template-columns: 1fr;
      }
    }

    &__quote {
      font-style: italic;
      color: var(--piano-text-secondary);
      border-left: 3px solid var(--piano-accent);
      padding: 0.75rem 1rem;
      margin: 1rem 0 0;
      background: var(--piano-bg-secondary);
      border-radius: var(--piano-radius-sm);
    }
  }
</style>
