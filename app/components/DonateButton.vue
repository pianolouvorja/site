<script setup lang="ts">
  /**
   * DonateButton — Asaas payment link.
   *
   * Renders nothing when NUXT_PUBLIC_ASAAS_DONATE_URL is not configured,
   * so local/dev builds stay clean until Ezequias sets the env on Hostinger.
   */
  const { t } = useI18n()
  const config = useRuntimeConfig()
  const donateUrl = config.public.asaasDonateUrl as string

  const paymentMethods = [
    { id: 'pix', icon: 'ti-brand-pix', label: computed(() => t('donate.pix')) },
    { id: 'boleto', icon: 'ti-barcode', label: computed(() => t('donate.boleto')) },
    { id: 'card', icon: 'ti-credit-card', label: computed(() => t('donate.card')) },
  ]
</script>

<template>
  <section v-if="donateUrl" class="donate" data-testid="donate-section">
    <div class="donate__container">
      <i class="ti ti-heart-filled donate__icon" />
      <h3 class="donate__title">
        {{ t('donate.title') }}
      </h3>
      <p class="donate__subtitle">
        {{ t('donate.subtitle') }}
      </p>

      <a
        :href="donateUrl"
        data-testid="donate-button"
        class="donate__button"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="t('donate.title')"
      >
        <i class="ti ti-heart" />
        {{ t('donate.button') }}
      </a>

      <div class="donate__methods">
        <span
          v-for="method in paymentMethods"
          :key="method.id"
          :data-testid="`donate-method-${method.id}`"
          class="donate__method"
        >
          <i :class="`ti ${method.icon}`" />
          {{ method.label }}
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .donate {
    padding: 3.5rem 1.5rem;
    background: var(--piano-dark);
    border-top: 1px solid var(--piano-slate);

    &__container {
      max-width: 540px;
      margin: 0 auto;
      text-align: center;
    }

    &__icon {
      font-size: 2rem;
      color: var(--piano-error, #ff5c5c);
      margin-bottom: 1rem;
      display: block;
    }

    &__title {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--piano-text-on-dark);
      margin-bottom: 0.5rem;
    }

    &__subtitle {
      font-size: 0.95rem;
      color: var(--piano-text-on-dark-muted);
      margin-bottom: 1.5rem;
    }

    &__button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.85rem 2rem;
      border-radius: var(--piano-radius-full);
      font-weight: 700;
      font-size: 1rem;
      background: linear-gradient(135deg, #ff5c5c 0%, #ff8a5c 100%);
      color: #fff;
      text-decoration: none;
      box-shadow: 0 8px 24px rgba(255, 92, 92, 0.35);
      transition:
        transform 0.2s,
        box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(255, 92, 92, 0.5);
      }

      i {
        font-size: 1.1rem;
      }
    }

    &__methods {
      display: flex;
      justify-content: center;
      gap: 1.25rem;
      margin-top: 1.25rem;
      flex-wrap: wrap;
    }

    &__method {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.85rem;
      color: var(--piano-text-on-dark-muted);

      i {
        font-size: 1rem;
        color: var(--piano-cyan);
      }
    }
  }
</style>
