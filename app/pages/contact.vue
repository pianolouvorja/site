<script setup lang="ts">
  import { useI18n } from '#imports'
  import ContactFormSelect from '~/components/ContactFormSelect.vue'

  const { t } = useI18n()

  // SEO
  useAppHead({
    title: t('contact.title'),
    description: t('contact.description'),
    path: '/contact',
  })
</script>

<template>
  <div class="contact-page">
    <!-- Hero -->
    <section class="contact-hero">
      <div class="contact-hero__container">
        <span class="contact-hero__eyebrow">{{ $t('contact.eyebrow') }}</span>
        <h1 class="contact-hero__title">
          {{ $t('contact.title') }}
        </h1>
        <p class="contact-hero__subtitle">
          {{ $t('contact.description') }}
        </p>
      </div>
    </section>

    <!-- Contact content -->
    <section class="contact-content">
      <div class="contact-content__container">
        <!-- Form dinâmico -->
        <div class="contact-form">
          <ContactFormSelect />
        </div>

        <!-- Side info -->
        <aside class="contact-info">
          <div class="contact-info__card">
            <i class="ti ti-mail contact-info__icon" aria-hidden="true" />
            <h2 class="contact-info__title">
              {{ $t('contact.direct') }}
            </h2>
            <a
              href="mailto:app@pianolouvorja.com.br"
              class="contact-info__email"
              data-testid="contact-email-link"
            >
              app@pianolouvorja.com.br
            </a>
          </div>

          <div class="contact-info__card contact-info__card--accent">
            <i class="ti ti-clock-hour-4 contact-info__icon" aria-hidden="true" />
            <p class="contact-info__text">
              {{ $t('contact.responseTime') }}
            </p>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
  .contact-page {
    min-height: 100vh;
  }

  // ── Hero ─────────────────────────────────────
  .contact-hero {
    background: var(--piano-bg-primary);
    padding: 0 1.5rem 4rem;
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

  // ── Content ──────────────────────────────────
  .contact-content {
    padding: 3rem 1.5rem 6rem;
    background: var(--piano-white);

    &__container {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 3rem;
      max-width: 1100px;
      margin: 0 auto;
    }
  }

  // ── Form wrapper ─────────────────────────────
  .contact-form {
    // O ContactFormSelect traz seus próprios estilos
  }

  // ── Side info ────────────────────────────────
  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    &__card {
      padding: 2rem 1.5rem;
      text-align: center;
      background: var(--piano-gray-100);
      border-radius: var(--piano-radius-lg);

      &--accent {
        background: var(--piano-bg-accent);

        .contact-info__text {
          color: var(--piano-text-on-dark);
        }

        .contact-info__icon {
          color: var(--piano-yellow);
        }
      }
    }

    &__icon {
      font-size: 2.5rem;
      color: var(--piano-blue);
      margin-bottom: 1rem;
    }

    &__title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--piano-gray-700);
      margin-bottom: 0.75rem;
    }

    &__email {
      display: inline-block;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--piano-blue);
      text-decoration: none;
      word-break: break-word;
      transition: color 0.2s;

      &:hover {
        color: var(--piano-blue-light);
        text-decoration: underline;
      }
    }

    &__text {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--piano-gray-700);
    }
  }

  // ── Responsive ───────────────────────────────
  @media (max-width: 960px) {
    .contact-content__container {
      grid-template-columns: 1fr;
    }

    .contact-info {
      flex-direction: row;
      gap: 1rem;
    }

    .contact-info__card {
      flex: 1;
    }
  }

  @media (max-width: 600px) {
    .contact-hero {
      padding: 0 1.5rem 2.5rem;

      &__title {
        font-size: 2.2rem;
      }

      &__subtitle {
        font-size: 1.05rem;
      }
    }

    .contact-info {
      flex-direction: column;
    }
  }
</style>
