<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useNewsletter } from '~/composables/useNewsletter'

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  const { t } = useI18n()
  const { status, errorMessage, validateEmail, subscribe, reset } = useNewsletter()

  const email = ref('')

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  })

  const isLoading = computed(() => status.value === 'loading')
  const isSuccess = computed(() => status.value === 'success')
  const isError = computed(() => status.value === 'error')
  const isDisabled = computed(() => isLoading.value || isSuccess.value)

  watch(isOpen, (open) => {
    if (!open) {
      email.value = ''
      reset()
    }
  })

  function close() {
    isOpen.value = false
  }

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) close()
  }

  async function handleSubmit() {
    if (isLoading.value) return
    const trimmed = email.value.trim()
    if (!trimmed || !validateEmail(trimmed)) return
    await subscribe(trimmed)
  }
</script>

<template>
  <Teleport to="body">
    <Transition name="notify-fade">
      <div
        v-if="isOpen"
        data-testid="notify-modal-backdrop"
        class="notify-modal__backdrop"
        @click="handleBackdrop"
      >
        <div
          data-testid="notify-modal"
          class="notify-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="t('notifyModal.title')"
        >
          <button
            data-testid="notify-modal-close"
            class="notify-modal__close"
            :aria-label="t('notifyModal.title')"
            @click="close"
          >
            <i class="ti ti-x" />
          </button>

          <div v-if="!isSuccess" class="notify-modal__body">
            <i class="ti ti-bell-ringing notify-modal__icon" />
            <h3 class="notify-modal__title">
              {{ t('notifyModal.title') }}
            </h3>
            <p class="notify-modal__subtitle">
              {{ t('notifyModal.subtitle') }}
            </p>

            <form class="notify-modal__form" @submit.prevent="handleSubmit">
              <input
                v-model="email"
                data-testid="notify-modal-email"
                type="email"
                class="notify-modal__input"
                :placeholder="t('notifyModal.placeholder')"
                :disabled="isLoading"
                required
              />
              <button
                data-testid="notify-modal-submit"
                type="submit"
                class="notify-modal__button"
                :disabled="isDisabled"
              >
                <i v-if="isLoading" class="ti ti-loader ti-spin" />
                {{ isLoading ? t('notifyModal.loading') : t('notifyModal.button') }}
              </button>
            </form>

            <Transition name="notify-fade">
              <p
                v-if="isError"
                data-testid="notify-modal-error"
                class="notify-modal__message notify-modal__message--error"
              >
                <i class="ti ti-alert-circle" />
                {{ errorMessage }}
              </p>
            </Transition>
          </div>

          <div v-else class="notify-modal__body">
            <i class="ti ti-check notify-modal__success-icon" />
            <p data-testid="notify-modal-success" class="notify-modal__success-text">
              {{ t('notifyModal.success') }}
            </p>
            <button class="notify-modal__button" @click="close">
              {{ t('notifyModal.button') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
  .notify-modal {
    &__backdrop {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
    }

    &__close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--piano-radius-full);
      border: none;
      background: var(--piano-bg-secondary);
      color: var(--piano-text-secondary);
      cursor: pointer;
      font-size: 1.2rem;
      transition: background 0.2s;

      &:hover {
        background: var(--piano-bg-solid);
        color: var(--piano-text);
      }
    }

    & {
      position: relative;
      width: 100%;
      max-width: 440px;
      background: var(--piano-bg-solid);
      border-radius: var(--piano-radius-lg);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    &__body {
      padding: 2.5rem 2rem;
      text-align: center;
    }

    &__icon {
      font-size: 2.5rem;
      color: var(--piano-accent);
      margin-bottom: 1rem;
      display: block;
    }

    &__title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--piano-text);
      margin-bottom: 0.5rem;
    }

    &__subtitle {
      font-size: 0.95rem;
      color: var(--piano-text-secondary);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    &__form {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    &__input {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: var(--piano-radius-md);
      background: var(--piano-bg-secondary);
      border: 1px solid var(--piano-border, rgba(0, 0, 0, 0.1));
      color: var(--piano-text);
      font-size: 0.95rem;

      &::placeholder {
        color: var(--piano-text-secondary);
      }

      &:focus {
        outline: none;
        border-color: var(--piano-accent);
      }
    }

    &__button {
      width: 100%;
      padding: 0.8rem 1.5rem;
      border-radius: var(--piano-radius-md);
      font-weight: 600;
      font-size: 0.95rem;
      background: var(--piano-accent);
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
    }

    &__message {
      margin-top: 1rem;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;

      &--error {
        color: var(--piano-error);
      }
    }

    &__success-icon {
      font-size: 3rem;
      color: var(--piano-accent);
      margin-bottom: 1rem;
      display: block;
    }

    &__success-text {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--piano-text);
      margin-bottom: 1.5rem;
    }
  }

  .notify-fade-enter-active,
  .notify-fade-leave-active {
    transition: opacity 0.3s;
  }

  .notify-fade-enter-from,
  .notify-fade-leave-to {
    opacity: 0;
  }

  @media (max-width: 480px) {
    .notify-modal {
      &__body {
        padding: 2rem 1.5rem;
      }

      &__title {
        font-size: 1.2rem;
      }
    }
  }
</style>
