<script setup lang="ts">
  const { t } = useI18n()

  withDefaults(
    defineProps<{
      variant?: 'inline' | 'card'
    }>(),
    {
      variant: 'card',
    },
  )

  // PayPal link
  const paypalLink = 'https://paypal.me/ezequiasfonseca'
  // Pix (can be a copy-paste key or link, using a placeholder for now)
  const pixKey = "contato{'@'}pianolouvorja.com.br"

  function copyPix() {
    if (typeof window !== 'undefined') {
      window.navigator.clipboard.writeText(pixKey)
      window.alert('Chave PIX copiada!')
    }
  }
</script>

<template>
  <div class="donate-button" :class="[`donate-button--${variant}`]">
    <template v-if="variant === 'card'">
      <h4 class="donate-button__title">
        {{ t('donate.title') }}
      </h4>
      <p class="donate-button__desc">
        {{ t('donate.description') }}
      </p>
    </template>

    <div class="donate-button__actions">
      <a
        data-testid="donate-paypal"
        :href="paypalLink"
        target="_blank"
        rel="noopener noreferrer"
        class="donate-button__btn donate-button__btn--paypal"
      >
        <i class="ti ti-brand-paypal" />
        {{ t('donate.paypal') }}
      </a>

      <button
        data-testid="donate-pix"
        class="donate-button__btn donate-button__btn--pix"
        @click="copyPix"
      >
        <i class="ti ti-currency-real" />
        {{ t('donate.pix') }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .donate-button {
    &--card {
      background: var(--piano-bg-secondary);
      padding: 1.5rem;
      border-radius: var(--piano-radius-md, 8px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
    }

    &--inline {
      .donate-button__actions {
        justify-content: flex-start;
      }
    }

    &__title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 0.5rem;
    }

    &__desc {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 1.5rem;
    }

    &__actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    &__btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      cursor: pointer;
      transition:
        transform 0.2s,
        opacity 0.2s;
      border: none;

      &:hover {
        transform: translateY(-1px);
      }

      &--paypal {
        background: #00457c;
        color: #fff;
      }

      &--pix {
        background: #32bcad;
        color: #fff;
      }
    }
  }
</style>
