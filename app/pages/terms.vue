<script setup lang="ts">
  const { t } = useI18n()
  const { raw, has } = useLocaleMessages()

  // SEO
  useHead({
    title: () => `${t('terms.title')} — PIANO LouvorJA`,
    meta: [
      { name: 'description', content: () => t('terms.metaDescription') },
      { name: 'robots', content: 'index, follow' },
    ],
  })

  // Sections keyed by terms.sections.*
  const sections = [
    { id: 'acceptance', icon: 'ti-check' },
    { id: 'service', icon: 'ti-app-window' },
    { id: 'license', icon: 'ti-license' },
    { id: 'user', icon: 'ti-user' },
    { id: 'responsibility', icon: 'ti-alert-triangle' },
    { id: 'ip', icon: 'ti-copyright' },
    { id: 'donations', icon: 'ti-heart' },
    { id: 'privacy', icon: 'ti-shield-lock' },
    { id: 'modifications', icon: 'ti-edit' },
    { id: 'termination', icon: 'ti-x' },
    { id: 'law', icon: 'ti-scale' },
    { id: 'misc', icon: 'ti-dots' },
  ]
</script>

<template>
  <div class="legal-page">
    <div class="legal-page__container">
      <header class="legal-page__header">
        <h1 class="legal-page__title">
          {{ $t('terms.title') }}
        </h1>
        <p class="legal-page__updated">
          {{ $t('terms.lastUpdated') }}
        </p>
      </header>

      <div class="legal-page__intro">
        <p>{{ $t('terms.intro') }}</p>
      </div>

      <nav class="legal-page__toc" :aria-label="$t('terms.tocLabel')">
        <ul>
          <li v-for="section in sections" :key="section.id">
            <a :href="`#${section.id}`">
              <i :class="`ti ${section.icon}`" />
              {{ $t(`terms.sections.${section.id}.title`) }}
            </a>
          </li>
        </ul>
      </nav>

      <article class="legal-page__content">
        <section
          v-for="section in sections"
          :id="section.id"
          :key="section.id"
          class="legal-page__section"
        >
          <h2 class="legal-page__section-title">
            {{ $t(`terms.sections.${section.id}.title`) }}
          </h2>
          <div class="legal-page__section-body">
            <LegalBodyItem
              v-for="(line, i) in raw<string[]>(`terms.sections.${section.id}.body`)"
              :key="i"
              :message="line"
              :link-url="
                has(`terms.sections.${section.id}.link`)
                  ? $t(`terms.sections.${section.id}.link.url`)
                  : undefined
              "
              :link-text="
                has(`terms.sections.${section.id}.link`)
                  ? $t(`terms.sections.${section.id}.link.text`)
                  : undefined
              "
              :external="
                has(`terms.sections.${section.id}.link`)
                  ? ($t(`terms.sections.${section.id}.link.url`) as string).startsWith('http')
                  : false
              "
            />
          </div>
        </section>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .legal-page {
    background: var(--piano-dark);
    color: rgba(255, 255, 255, 0.85);
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
      color: #fff;
      margin: 0 0 0.5rem;
    }

    &__updated {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    &__intro {
      background: rgba(255, 255, 255, 0.05);
      border-radius: var(--piano-radius-md);
      padding: 1.5rem;
      margin-bottom: 3rem;
      border-left: 4px solid var(--piano-cyan);
    }

    &__toc {
      background: rgba(255, 255, 255, 0.03);
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
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        font-size: 0.9rem;
        padding: 0.5rem;
        border-radius: var(--piano-radius-sm);
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--piano-cyan);
        }

        i {
          font-size: 1rem;
          color: var(--piano-cyan);
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
      color: #fff;
      margin: 0 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    &__section-body {
      font-size: 0.95rem;
      line-height: 1.7;
      color: rgba(255, 255, 255, 0.75);

      p {
        margin: 0 0 0.75rem;
      }

      a {
        color: var(--piano-cyan);
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
  }
</style>
