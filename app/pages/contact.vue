<script setup lang="ts">
  const { t } = useI18n()

  // Web3Forms config — from runtimeConfig (env variable WEB3FORMS_ACCESS_KEY)
  const { web3formsKey: WEB3FORMS_ACCESS_KEY } = useRuntimeConfig().public

  // Form state
  const form = reactive({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')

  // Simple validation
  const isValid = computed(
    () =>
      form.name.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
      form.subject.trim().length >= 3 &&
      form.message.trim().length >= 10,
  )

  const submitForm = async () => {
    if (!isValid.value || status.value === 'sending') return

    status.value = 'sending'

    try {
      const response = (await $fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: {
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `[PIANO Site] ${form.subject}`,
          from_name: form.name,
          name: form.name,
          email: form.email,
          message: form.message,
        },
      })) as { success: boolean }

      if (response.success) {
        status.value = 'success'
        // Reset form
        form.name = ''
        form.email = ''
        form.subject = ''
        form.message = ''
      } else {
        status.value = 'error'
      }
    } catch {
      status.value = 'error'
    }
  }

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
        <!-- Form -->
        <div class="contact-form">
          <!-- Success state -->
          <div
            v-if="status === 'success'"
            class="contact-form__alert contact-form__alert--success"
            role="status"
            aria-live="polite"
          >
            <i class="ti ti-circle-check" aria-hidden="true" />
            <p>{{ $t('contact.form.success') }}</p>
            <button class="contact-form__reset-btn" type="button" @click="status = 'idle'">
              {{ $t('contact.form.submit') }}
            </button>
          </div>

          <!-- Error state -->
          <div
            v-else-if="status === 'error'"
            class="contact-form__alert contact-form__alert--error"
            role="alert"
            aria-live="assertive"
          >
            <i class="ti ti-alert-circle" aria-hidden="true" />
            <p>{{ $t('contact.form.error') }}</p>
          </div>

          <!-- Form fields -->
          <form
            v-if="status !== 'success'"
            class="contact-form__fields"
            novalidate
            @submit.prevent="submitForm"
          >
            <!-- Name -->
            <div class="contact-form__group">
              <label class="contact-form__label" for="contact-name">
                {{ $t('contact.form.name') }}
              </label>
              <input
                id="contact-name"
                v-model="form.name"
                type="text"
                class="contact-form__input"
                :placeholder="$t('contact.form.namePlaceholder')"
                :aria-label="$t('contact.form.name')"
                required
                data-testid="contact-name-input"
              />
            </div>

            <!-- Email -->
            <div class="contact-form__group">
              <label class="contact-form__label" for="contact-email">
                {{ $t('contact.form.email') }}
              </label>
              <input
                id="contact-email"
                v-model="form.email"
                type="email"
                class="contact-form__input"
                :placeholder="$t('contact.form.emailPlaceholder')"
                :aria-label="$t('contact.form.email')"
                required
                data-testid="contact-email-input"
              />
            </div>

            <!-- Subject -->
            <div class="contact-form__group">
              <label class="contact-form__label" for="contact-subject">
                {{ $t('contact.form.subject') }}
              </label>
              <input
                id="contact-subject"
                v-model="form.subject"
                type="text"
                class="contact-form__input"
                :placeholder="$t('contact.form.subjectPlaceholder')"
                :aria-label="$t('contact.form.subject')"
                required
                data-testid="contact-subject-input"
              />
            </div>

            <!-- Message -->
            <div class="contact-form__group">
              <label class="contact-form__label" for="contact-message">
                {{ $t('contact.form.message') }}
              </label>
              <textarea
                id="contact-message"
                v-model="form.message"
                class="contact-form__textarea"
                :placeholder="$t('contact.form.messagePlaceholder')"
                :aria-label="$t('contact.form.message')"
                rows="5"
                required
                data-testid="contact-message-input"
              />
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="contact-form__submit"
              :disabled="!isValid || status === 'sending'"
              data-testid="contact-submit-btn"
            >
              <span v-if="status === 'sending'">{{ $t('contact.form.sending') }}</span>
              <span v-else>{{ $t('contact.form.submit') }}</span>
            </button>
          </form>
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

  // ── Form ─────────────────────────────────────
  .contact-form {
    &__fields {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    &__group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    &__label {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--piano-gray-700);
    }

    &__input,
    &__textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      font-family: inherit;
      color: var(--piano-dark);
      background: var(--piano-gray-100);
      border: 2px solid transparent;
      border-radius: var(--piano-radius-md);
      transition:
        border-color 0.2s,
        background 0.2s;
      outline: none;

      &::placeholder {
        color: var(--piano-gray-500);
      }

      &:focus {
        border-color: var(--piano-blue);
        background: var(--piano-white);
      }
    }

    &__textarea {
      resize: vertical;
      min-height: 120px;
    }

    &__submit {
      align-self: flex-start;
      padding: 0.8rem 2rem;
      font-size: 1rem;
      font-weight: 700;
      font-family: inherit;
      color: var(--piano-text-on-dark);
      background: var(--piano-blue);
      border: none;
      border-radius: var(--piano-radius-full);
      cursor: pointer;
      transition:
        background 0.2s,
        transform 0.1s,
        opacity 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;

      &:hover:not(:disabled) {
        background: var(--piano-blue-light);
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    // ── Alerts ───────────────────────────────
    &__alert {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      text-align: center;
      padding: 2rem 1.5rem;
      border-radius: var(--piano-radius-lg);

      i {
        font-size: 3rem;
      }

      p {
        font-size: 1.05rem;
        line-height: 1.6;
      }

      &--success {
        background: rgba(0, 193, 230, 0.08);
        color: var(--piano-blue);

        i {
          color: var(--piano-cyan);
        }
      }

      &--error {
        background: rgba(220, 38, 38, 0.08);
        color: #dc2626;

        i {
          color: #dc2626;
        }
      }
    }

    &__reset-btn {
      margin-top: 0.5rem;
      padding: 0.6rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      font-family: inherit;
      color: var(--piano-text-on-dark);
      background: var(--piano-blue);
      border: none;
      border-radius: var(--piano-radius-full);
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--piano-blue-light);
      }
    }
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
