<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useNewsletter } from '~/composables/useNewsletter'

  const { status, errorMessage, validateEmail, subscribe } = useNewsletter()

  const email = ref('')

  const isLoading = computed(() => status.value === 'loading')
  const isSuccess = computed(() => status.value === 'success')
  const isError = computed(() => status.value === 'error')
  const isDisabled = computed(() => isLoading.value || isSuccess.value)

  async function handleSubmit() {
    if (isLoading.value) return

    const trimmed = email.value.trim()
    if (!trimmed || !validateEmail(trimmed)) {
      return
    }

    await subscribe(trimmed)
  }
</script>

<template>
  <section class="newsletter">
    <div class="newsletter__container">
      <i class="ti ti-mail newsletter__icon" />
      <h3 class="newsletter__title">
        {{ $t('newsletter.title') }}
      </h3>
      <p class="newsletter__subtitle">
        {{ $t('newsletter.subtitle') }}
      </p>

      <form v-if="!isSuccess" class="newsletter__form" @submit.prevent="handleSubmit">
        <input
          v-model="email"
          data-testid="newsletter-email"
          type="email"
          class="newsletter__input"
          :placeholder="$t('newsletter.placeholder')"
          :disabled="isLoading"
          required
        />
        <button
          data-testid="newsletter-submit"
          type="submit"
          class="newsletter__button"
          :disabled="isDisabled"
        >
          <i v-if="isLoading" class="ti ti-loader ti-spin" />
          {{ isLoading ? $t('newsletter.loading') : $t('newsletter.button') }}
        </button>
      </form>

      <transition name="fade">
        <p
          v-if="isError"
          data-testid="newsletter-error"
          class="newsletter__message newsletter__message--error"
        >
          <i class="ti ti-alert-circle" />
          {{ errorMessage }}
        </p>
      </transition>

      <transition name="fade">
        <p
          v-if="isSuccess"
          data-testid="newsletter-success"
          class="newsletter__message newsletter__message--success"
        >
          <i class="ti ti-check" />
          {{ $t('newsletter.success') }}
        </p>
      </transition>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .newsletter {
    padding: 3.5rem 1.5rem;
    background: var(--piano-bg-secondary);
    border-top: 1px solid rgba(255, 255, 255, 0.06);

    &__container {
      max-width: 540px;
      margin: 0 auto;
      text-align: center;
    }

    &__icon {
      font-size: 2rem;
      color: var(--piano-cyan);
      margin-bottom: 1rem;
      display: block;
    }

    &__title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.5rem;
    }

    &__subtitle {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 1.5rem;
    }

    &__form {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    &__input {
      flex: 1;
      min-width: 200px;
      padding: 0.75rem 1rem;
      border-radius: var(--piano-radius-md, 8px);
      background: var(--piano-bg-primary);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      font-size: 0.95rem;

      &::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }

      &:focus {
        outline: none;
        border-color: var(--piano-cyan);
      }
    }

    &__button {
      padding: 0.75rem 1.5rem;
      border-radius: var(--piano-radius-md, 8px);
      font-weight: 600;
      font-size: 0.95rem;
      background: linear-gradient(135deg, var(--piano-cyan) 0%, var(--piano-blue) 100%);
      color: #fff;
      border: none;
      cursor: pointer;
      transition:
        transform 0.2s,
        opacity 0.2s;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      i {
        margin-right: 0.25rem;
      }
    }

    &__message {
      margin-top: 1rem;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;

      &--error {
        color: #ff6b6b;
      }

      &--success {
        color: #51cf66;
        font-weight: 600;
        font-size: 1.05rem;
      }
    }

    @media (max-width: 480px) {
      &__form {
        flex-direction: column;
      }

      &__button {
        width: 100%;
      }
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
