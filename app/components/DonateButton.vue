<script setup lang="ts">
  import { ref } from 'vue'

  const { t } = useI18n()

  withDefaults(
    defineProps<{
      variant?: 'inline' | 'card'
    }>(),
    {
      variant: 'card',
    },
  )

  // PIX key for copy-paste
  const pixKey = 'contato@pianolouvorja.com.br'

  // Modal state
  const showModal = ref(false)
  const copied = ref(false)

  function openPixModal() {
    showModal.value = true
    copied.value = false
  }

  function closeModal() {
    showModal.value = false
    copied.value = false
  }

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(pixKey)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 3000)
    } catch {
      // Fallback: select text manually
      copied.value = false
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
      <button
        data-testid="donate-pix"
        class="donate-button__btn donate-button__btn--pix"
        @click="openPixModal"
      >
        <i class="ti ti-currency-real" />
        {{ t('donate.pix') }}
      </button>
    </div>

    <!-- Custom PIX Modal -->
    <Teleport to="body">
      <Transition name="pix-modal">
        <div
          v-if="showModal"
          class="pix-overlay"
          data-testid="pix-overlay"
          @click.self="closeModal"
        >
          <div class="pix-modal" role="dialog" aria-modal="true" :aria-label="t('donate.pixTitle')">
            <button
              class="pix-modal__close"
              data-testid="pix-close"
              :aria-label="t('donate.close')"
              @click="closeModal"
            >
              <i class="ti ti-x" />
            </button>

            <div class="pix-modal__icon">
              <i class="ti ti-currency-real" />
            </div>

            <h3 class="pix-modal__title">
              {{ t('donate.pixTitle') }}
            </h3>
            <p class="pix-modal__subtitle">
              {{ t('donate.pixSubtitle') }}
            </p>

            <div class="pix-modal__key-box">
              <code data-testid="pix-key">{{ pixKey }}</code>
              <button
                data-testid="pix-copy"
                class="pix-modal__copy-btn"
                :class="{ 'pix-modal__copy-btn--copied': copied }"
                @click="copyPix"
              >
                <i :class="copied ? 'ti ti-check' : 'ti ti-copy'" />
                {{ copied ? t('donate.copied') : t('donate.copy') }}
              </button>
            </div>

            <p class="pix-modal__hint">
              {{ t('donate.pixHint') }}
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
  .donate-button {
    &--card {
      background: var(--piano-slate);
      padding: 1.5rem;
      border-radius: var(--piano-radius-md);
      border: 1px solid var(--piano-border-subtle);
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
      color: var(--piano-text-on-dark);
      margin-bottom: 0.5rem;
    }

    &__desc {
      font-size: 0.9rem;
      color: var(--piano-text-on-dark-secondary);
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
      border-radius: var(--piano-radius-sm);
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

      &--pix {
        background: var(--piano-pix);
        color: var(--piano-text-on-dark);
      }
    }
  }

  /* Modal Overlay */
  .pix-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--piano-overlay);
    backdrop-filter: blur(4px);
    padding: 1rem;
  }

  /* Modal Box */
  .pix-modal {
    position: relative;
    background: var(--piano-dark);
    border: 1px solid var(--piano-pix-glow);
    border-radius: var(--piano-radius-lg);
    padding: 2.5rem 2rem 2rem;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow:
      0 0 40px var(--piano-pix-glow),
      0 20px 60px var(--piano-overlay);

    &__close {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--piano-text-on-dark-muted);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem;
      line-height: 1;
      transition: color 0.2s;

      &:hover {
        color: var(--piano-text-on-dark);
      }
    }

    &__icon {
      font-size: 2.5rem;
      color: var(--piano-pix);
      margin-bottom: 1rem;
    }

    &__title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--piano-text-on-dark);
      margin-bottom: 0.5rem;
    }

    &__subtitle {
      font-size: 0.9rem;
      color: var(--piano-text-on-dark-secondary);
      margin-bottom: 1.5rem;
    }

    &__key-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--piano-slate);
      border: 1px solid var(--piano-border-subtle);
      border-radius: var(--piano-radius-sm);
      padding: 0.75rem;
      margin-bottom: 1rem;

      code {
        flex: 1;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
        color: var(--piano-pix);
        word-break: break-all;
        text-align: left;
      }
    }

    &__copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--piano-pix);
      color: var(--piano-text-on-dark);
      border: none;
      border-radius: var(--piano-radius-sm);
      padding: 0.5rem 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s;
      flex-shrink: 0;

      &:hover {
        background: var(--piano-pix-hover);
      }

      &--copied {
        background: var(--piano-success);
      }
    }

    &__hint {
      font-size: 0.8rem;
      color: var(--piano-text-on-dark-muted);
      line-height: 1.4;
    }
  }

  /* Modal Transition */
  .pix-modal-enter-active,
  .pix-modal-leave-active {
    transition: opacity 0.25s ease;

    .pix-modal {
      transition: transform 0.25s ease;
    }
  }

  .pix-modal-enter-from,
  .pix-modal-leave-to {
    opacity: 0;

    .pix-modal {
      transform: scale(0.95) translateY(10px);
    }
  }
</style>
