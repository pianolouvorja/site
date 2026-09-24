<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useI18n } from '#imports'

const { t } = useI18n()

// Tipo selecionado: 'general' | 'tester' | 'developer' | 'bug'
const type = ref<'general' | 'tester' | 'developer' | 'bug'>('general')

// Estados por tipo
const forms = reactive({
  general: {
    name: '',
    email: '',
    subject: '',
    message: '',
  },
  tester: {
    name: '',
    email: '',
    focus: [] as string[],
    bio: '',
    links: '' as string, // URLs separadas por vírgula/nova linha
    avatar: null as File | null,
    avatarPreview: '' as string,
  },
  developer: {
    name: '',
    email: '',
    bio: '',
    github: '',
    portfolio: '',
    areas: [] as string[],
    availability: '',
    stack: '',
    motivation: '',
    avatar: null as File | null,
    avatarPreview: '' as string,
  },
  bug: {
    testerEmail: '',
    email: '',
    reportType: 'bug' as 'bug' | 'feature' | 'other',
    version: '',
    module: '',
    description: '',
    steps: '',
    attachment: null as File | null,
    attachmentPreview: '' as string,
  },
})

const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')

// Focos de teste (tester)
const TESTER_FOCUS = [
  'app-desktop',
  'web-pwa',
  'api',
  'mobile-flutter',
  'tv-receiver',
  'docs',
  'qa',
  'design',
] as const

// Áreas de dev (developer)
const DEV_AREAS = [
  'App Desktop (Electron)',
  'Web/PWA',
  'API',
  'Mobile (Flutter)',
  'TVs/Receiver',
  'Documentação',
  'Testes/QA',
  'Design/UI-UX',
] as const

// Helpers
const currentForm = computed(() => forms[type.value])
const currentKeys = computed(() => Object.keys(forms[type.value]).filter(k => !k.endsWith('Preview')))

function handleFileChange(field: 'avatar' | 'attachment', event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const form = forms[type.value]
  if (field === 'avatar') {
    form.avatar = file
    form.avatarPreview = URL.createObjectURL(file)
  } else {
    form.attachment = file
    form.attachmentPreview = URL.createObjectURL(file)
  }
}

function removeFile(field: 'avatar' | 'attachment'): void {
  const form = forms[type.value]
  if (field === 'avatar') {
    form.avatar = null
    form.avatarPreview = ''
  } else {
    form.attachment = null
    form.attachmentPreview = ''
  }
}

function resetCurrentForm(): void {
  const keys = Object.keys(forms[type.value])
  for (const key of keys) {
    if (key.endsWith('Preview')) continue
    const val = forms[type.value][key as keyof typeof forms.general]
    if (val instanceof File || (typeof val === 'string' && val.startsWith('blob:'))) continue
    if (Array.isArray(val)) {
      ;(forms[type.value] as any)[key] = []
    } else {
      ;(forms[type.value] as any)[key] = ''
    }
  }
  forms[type.value].avatar = null
  forms[type.value].avatarPreview = ''
  if ('attachment' in forms[type.value]) {
    ;(forms[type.value] as any).attachment = null
    ;(forms[type.value] as any).attachmentPreview = ''
  }
}

const isGeneralValid = computed(() => {
  const f = forms.general
  return f.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) &&
    f.subject.trim().length >= 3 &&
    f.message.trim().length >= 10
})

const isTesterValid = computed(() => {
  const f = forms.tester
  return f.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) &&
    f.focus.length > 0 &&
    f.bio.trim().length >= 10
})

const isDeveloperValid = computed(() => {
  const f = forms.developer
  return f.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) &&
    f.bio.trim().length >= 10 &&
    f.github.trim().length > 0 &&
    f.areas.length > 0 &&
    f.availability.trim().length > 0 &&
    f.stack.trim().length > 0 &&
    f.motivation.trim().length >= 20
})

const isBugValid = computed(() => {
  const f = forms.bug
  return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) || f.testerEmail.trim().length > 0) &&
    f.reportType.length > 0 &&
    f.version.trim().length > 0 &&
    f.module.trim().length > 0 &&
    f.description.trim().length >= 20
})

const isValid = computed(() => {
  switch (type.value) {
    case 'general': return isGeneralValid.value
    case 'tester': return isTesterValid.value
    case 'developer': return isDeveloperValid.value
    case 'bug': return isBugValid.value
  }
})

async function submitForm(): Promise<void> {
  if (!isValid.value || status.value === 'sending') return

  status.value = 'sending'

  try {
    const f = forms[type.value]

    // Payload JSON — a rota /api/v1/community/register é JSON-only
    const payload: Record<string, unknown> = {
      type: type.value,
      name: f.name,
      email: f.email,
    }

    // Por tipo
    switch (type.value) {
      case 'general':
        payload.subject = f.subject
        payload.message = f.message
        break

      case 'tester':
        payload.focus = (f.focus as string[]).join(',')
        payload.bio = f.bio
        payload.links = f.links
        break

      case 'developer':
        payload.bio = f.bio
        payload.github = f.github
        payload.portfolio = f.portfolio
        payload.areas = (f.areas as string[]).join(',')
        payload.availability = f.availability
        payload.stack = f.stack
        payload.motivation = f.motivation
        break

      case 'bug':
        if (f.testerEmail) payload.testerEmail = f.testerEmail
        payload.reportType = f.reportType
        payload.version = f.version
        payload.module = f.module
        payload.description = f.description
        payload.steps = f.steps
        break
    }

    const response = await $fetch('/api/v1/community/register', {
      method: 'POST',
      body: payload,
    }) as { success?: boolean; ok?: boolean; message?: string }

    if (response.ok || response.success) {
      status.value = 'success'
      resetCurrentForm()
    } else {
      status.value = 'error'
      // TODO: mostrar response.message se houver
    }
  } catch (e) {
    console.error('Contact form error:', e)
    status.value = 'error'
  }
}

// Limpa previews ao trocar tipo
watch(type, () => {
  status.value = 'idle'
}, { immediate: false })
</script>

<template>
  <div class="contact-form-select">
    <!-- Select de tipo -->
    <div class="contact-form-select__type">
      <label class="contact-form-select__label" for="contact-type">
        {{ $t('contact.form.typeLabel') }}
      </label>
      <select
        id="contact-type"
        v-model="type"
        class="contact-form-select__select"
        :aria-label="$t('contact.form.typeLabel')"
        data-testid="contact-type-select"
      >
        <option value="general">{{ $t('contact.form.type.general') }}</option>
        <option value="tester">{{ $t('contact.form.type.tester') }}</option>
        <option value="developer">{{ $t('contact.form.type.developer') }}</option>
        <option value="bug">{{ $t('contact.form.type.bug') }}</option>
      </select>
    </div>

    <!-- Success state -->
    <div
      v-if="status === 'success'"
      class="contact-form-select__alert contact-form-select__alert--success"
      role="status"
      aria-live="polite"
    >
      <i class="ti ti-circle-check" aria-hidden="true" />
      <p>{{ $t('contact.form.success') }}</p>
      <button
        class="contact-form-select__reset-btn"
        type="button"
        @click="status = 'idle'"
      >
        {{ $t('contact.form.submit') }}
      </button>
    </div>

    <!-- Error state -->
    <div
      v-else-if="status === 'error'"
      class="contact-form-select__alert contact-form-select__alert--error"
      role="alert"
      aria-live="assertive"
    >
      <i class="ti ti-alert-circle" aria-hidden="true" />
      <p>{{ $t('contact.form.error') }}</p>
    </div>

    <!-- Forms dinâmicos -->
    <form
      v-else
      class="contact-form-select__fields"
      novalidate
      @submit.prevent="submitForm"
    >
      <!-- GERAL -->
      <fieldset v-if="type === 'general'" class="contact-form-select__fieldset" data-testid="contact-form-general">
        <legend class="contact-form-select__legend">{{ $t('contact.form.type.general') }}</legend>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="contact-name">
            {{ $t('contact.form.name') }}
          </label>
          <input
            id="contact-name"
            v-model="forms.general.name"
            type="text"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.namePlaceholder')"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="contact-email">
            {{ $t('contact.form.email') }}
          </label>
          <input
            id="contact-email"
            v-model="forms.general.email"
            type="email"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.emailPlaceholder')"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="contact-subject">
            {{ $t('contact.form.subject') }}
          </label>
          <input
            id="contact-subject"
            v-model="forms.general.subject"
            type="text"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.subjectPlaceholder')"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="contact-message">
            {{ $t('contact.form.message') }}
          </label>
          <textarea
            id="contact-message"
            v-model="forms.general.message"
            class="contact-form-select__textarea"
            :placeholder="$t('contact.form.messagePlaceholder')"
            rows="5"
            required
          />
        </div>
      </fieldset>

      <!-- TESTADOR -->
      <fieldset v-else-if="type === 'tester'" class="contact-form-select__fieldset" data-testid="contact-form-tester">
        <legend class="contact-form-select__legend">{{ $t('contact.form.type.tester') }}</legend>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="tester-name">
            {{ $t('contact.form.name') }}
          </label>
          <input
            id="tester-name"
            v-model="forms.tester.name"
            type="text"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.namePlaceholder')"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="tester-email">
            {{ $t('contact.form.email') }}
          </label>
          <input
            id="tester-email"
            v-model="forms.tester.email"
            type="email"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.emailPlaceholder')"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label">
            {{ $t('contact.form.focusLabel') }}
          </label>
          <div class="contact-form-select__checkbox-group">
            <label
              v-for="focus in TESTER_FOCUS"
              :key="focus"
              class="contact-form-select__checkbox"
            >
              <input
                type="checkbox"
                :value="focus"
                v-model="forms.tester.focus"
              />
              <span>{{ $t(`contact.form.focus.${focus}`) }}</span>
            </label>
          </div>
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="tester-bio">
            {{ $t('contact.form.bio') }}
          </label>
          <textarea
            id="tester-bio"
            v-model="forms.tester.bio"
            class="contact-form-select__textarea"
            :placeholder="$t('contact.form.bioPlaceholder')"
            rows="3"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="tester-links">
            {{ $t('contact.form.links') }}
          </label>
          <textarea
            id="tester-links"
            v-model="forms.tester.links"
            class="contact-form-select__textarea"
            :placeholder="$t('contact.form.linksPlaceholder')"
            rows="2"
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label">
            {{ $t('contact.form.avatar') }}
          </label>
          <div class="contact-form-select__file-upload">
            <input
              type="file"
              id="tester-avatar"
              accept="image/*"
              @change="handleFileChange('avatar', $event)"
              class="contact-form-select__file-input"
              data-testid="tester-avatar-input"
            />
            <label v-if="forms.tester.avatarPreview" for="tester-avatar" class="contact-form-select__file-preview">
              <img :src="forms.tester.avatarPreview" :alt="$t('contact.form.avatarPreview')" />
              <button type="button" @click="removeFile('avatar')" class="contact-form-select__file-remove" aria-label="{{ $t('contact.form.removeAvatar') }}">
                <i class="ti ti-x" aria-hidden="true" />
              </button>
            </label>
            <label v-else for="tester-avatar" class="contact-form-select__file-placeholder">
              <i class="ti ti-upload" aria-hidden="true" />
              <span>{{ $t('contact.form.avatarPlaceholder') }}</span>
            </label>
          </div>
        </div>
      </fieldset>

      <!-- DESENVOLVEDOR -->
      <fieldset v-else-if="type === 'developer'" class="contact-form-select__fieldset" data-testid="contact-form-developer">
        <legend class="contact-form-select__legend">{{ $t('contact.form.type.developer') }}</legend>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="dev-name">
            {{ $t('contact.form.name') }}
          </label>
          <input
            id="dev-name"
            v-model="forms.developer.name"
            type="text"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.namePlaceholder')"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="dev-email">
            {{ $t('contact.form.email') }}
          </label>
          <input
            id="dev-email"
            v-model="forms.developer.email"
            type="email"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.emailPlaceholder')"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="dev-bio">
            {{ $t('contact.form.bio') }}
          </label>
          <textarea
            id="dev-bio"
            v-model="forms.developer.bio"
            class="contact-form-select__textarea"
            :placeholder="$t('contact.form.bioPlaceholder')"
            rows="3"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="dev-github">
            {{ $t('contact.form.github') }}
          </label>
          <input
            id="dev-github"
            v-model="forms.developer.github"
            type="text"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.githubPlaceholder')"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="dev-portfolio">
            {{ $t('contact.form.portfolio') }}
          </label>
          <input
            id="dev-portfolio"
            v-model="forms.developer.portfolio"
            type="text"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.portfolioPlaceholder')"
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label">
            {{ $t('contact.form.areas') }}
          </label>
          <div class="contact-form-select__checkbox-group">
            <label
              v-for="area in DEV_AREAS"
              :key="area"
              class="contact-form-select__checkbox"
            >
              <input
                type="checkbox"
                :value="area"
                v-model="forms.developer.areas"
              />
              <span>{{ area }}</span>
            </label>
          </div>
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="dev-availability">
            {{ $t('contact.form.availability') }}
          </label>
          <input
            id="dev-availability"
            v-model="forms.developer.availability"
            type="text"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.availabilityPlaceholder')"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="dev-stack">
            {{ $t('contact.form.stack') }}
          </label>
          <textarea
            id="dev-stack"
            v-model="forms.developer.stack"
            class="contact-form-select__textarea"
            :placeholder="$t('contact.form.stackPlaceholder')"
            rows="2"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="dev-motivation">
            {{ $t('contact.form.motivation') }}
          </label>
          <textarea
            id="dev-motivation"
            v-model="forms.developer.motivation"
            class="contact-form-select__textarea"
            :placeholder="$t('contact.form.motivationPlaceholder')"
            rows="3"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label">
            {{ $t('contact.form.avatar') }}
          </label>
          <div class="contact-form-select__file-upload">
            <input
              type="file"
              id="dev-avatar"
              accept="image/*"
              @change="handleFileChange('avatar', $event)"
              class="contact-form-select__file-input"
              data-testid="dev-avatar-input"
            />
            <label v-if="forms.developer.avatarPreview" for="dev-avatar" class="contact-form-select__file-preview">
              <img :src="forms.developer.avatarPreview" :alt="$t('contact.form.avatarPreview')" />
              <button type="button" @click="removeFile('avatar')" class="contact-form-select__file-remove" aria-label="{{ $t('contact.form.removeAvatar') }}">
                <i class="ti ti-x" aria-hidden="true" />
              </button>
            </label>
            <label v-else for="dev-avatar" class="contact-form-select__file-placeholder">
              <i class="ti ti-upload" aria-hidden="true" />
              <span>{{ $t('contact.form.avatarPlaceholder') }}</span>
            </label>
          </div>
        </div>
      </fieldset>

      <!-- BUG -->
      <fieldset v-else-if="type === 'bug'" class="contact-form-select__fieldset" data-testid="contact-form-bug">
        <legend class="contact-form-select__legend">{{ $t('contact.form.type.bug') }}</legend>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="bug-tester-email">
            {{ $t('contact.form.testerEmail') }}
          </label>
          <input
            id="bug-tester-email"
            v-model="forms.bug.testerEmail"
            type="email"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.testerEmailPlaceholder')"
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="bug-email">
            {{ $t('contact.form.email') }}
          </label>
          <input
            id="bug-email"
            v-model="forms.bug.email"
            type="email"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.emailPlaceholder')"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="bug-type">
            {{ $t('contact.form.reportTypeLabel') }}
          </label>
          <select
            id="bug-type"
            v-model="forms.bug.reportType"
            class="contact-form-select__select"
            required
          >
            <option value="bug">{{ $t('contact.form.reportType.bug') }}</option>
            <option value="feature">{{ $t('contact.form.reportType.feature') }}</option>
            <option value="other">{{ $t('contact.form.reportType.other') }}</option>
          </select>
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="bug-version">
            {{ $t('contact.form.version') }}
          </label>
          <input
            id="bug-version"
            v-model="forms.bug.version"
            type="text"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.versionPlaceholder')"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="bug-module">
            {{ $t('contact.form.module') }}
          </label>
          <input
            id="bug-module"
            v-model="forms.bug.module"
            type="text"
            class="contact-form-select__input"
            :placeholder="$t('contact.form.modulePlaceholder')"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="bug-description">
            {{ $t('contact.form.description') }}
          </label>
          <textarea
            id="bug-description"
            v-model="forms.bug.description"
            class="contact-form-select__textarea"
            :placeholder="$t('contact.form.descriptionPlaceholder')"
            rows="4"
            required
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label" for="bug-steps">
            {{ $t('contact.form.steps') }}
          </label>
          <textarea
            id="bug-steps"
            v-model="forms.bug.steps"
            class="contact-form-select__textarea"
            :placeholder="$t('contact.form.stepsPlaceholder')"
            rows="3"
          />
        </div>

        <div class="contact-form-select__group">
          <label class="contact-form-select__label">
            {{ $t('contact.form.attachment') }}
          </label>
          <div class="contact-form-select__file-upload">
            <input
              type="file"
              id="bug-attachment"
              accept="image/*,.pdf,.txt,.log,.json"
              @change="handleFileChange('attachment', $event)"
              class="contact-form-select__file-input"
              data-testid="bug-attachment-input"
            />
            <label v-if="forms.bug.attachmentPreview" for="bug-attachment" class="contact-form-select__file-preview">
              <span class="contact-form-select__file-name">{{ forms.bug.attachment?.name }}</span>
              <button type="button" @click="removeFile('attachment')" class="contact-form-select__file-remove" aria-label="{{ $t('contact.form.removeAttachment') }}">
                <i class="ti ti-x" aria-hidden="true" />
              </button>
            </label>
            <label v-else for="bug-attachment" class="contact-form-select__file-placeholder">
              <i class="ti ti-upload" aria-hidden="true" />
              <span>{{ $t('contact.form.attachmentPlaceholder') }}</span>
            </label>
          </div>
        </div>
      </fieldset>

      <!-- Submit -->
      <button
        type="submit"
        class="contact-form-select__submit"
        :disabled="!isValid || status === 'sending'"
        data-testid="contact-submit-btn"
      >
        <span v-if="status === 'sending'">{{ $t('contact.form.sending') }}</span>
        <span v-else>{{ $t('contact.form.submit') }}</span>
      </button>
    </form>
  </div>
</template>

<style scoped lang="scss">
.contact-form-select {
  &__type {
    margin-bottom: 1.5rem;
  }

  &__label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--piano-gray-700);
    margin-bottom: 0.4rem;
  }

  &__select {
    width: 100%;
    max-width: 320px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-family: inherit;
    color: var(--piano-dark);
    background: var(--piano-gray-100);
    border: 2px solid transparent;
    border-radius: var(--piano-radius-md);
    outline: none;
    transition: border-color 0.2s, background 0.2s;

    &:focus {
      border-color: var(--piano-blue);
      background: var(--piano-white);
    }
  }

  &__fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }

  &__legend {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--piano-gray-800);
    margin-bottom: 1.25rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--piano-gray-200);
  }

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
    transition: border-color 0.2s, background 0.2s;
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
    min-height: 100px;
  }

  &__checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    margin-top: 0.25rem;
  }

  &__checkbox {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: var(--piano-gray-700);
    cursor: pointer;

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--piano-blue);
    }
  }

  // File upload
  &__file-upload {
    position: relative;
  }

  &__file-input {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 1;
  }

  &__file-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 2rem 1.5rem;
    border: 2px dashed var(--piano-gray-300);
    border-radius: var(--piano-radius-md);
    background: var(--piano-gray-50);
    color: var(--piano-gray-600);
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;

    i {
      font-size: 2rem;
      color: var(--piano-gray-400);
    }

    &:hover {
      border-color: var(--piano-blue);
      background: rgba(0, 193, 230, 0.05);
    }
  }

  &__file-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: var(--piano-gray-100);
    border: 2px solid var(--piano-gray-200);
    border-radius: var(--piano-radius-md);

    img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: var(--piano-radius-sm);
    }

    .contact-form-select__file-name {
      flex: 1;
      font-size: 0.9rem;
      color: var(--piano-gray-700);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__file-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: var(--piano-gray-500);
    border-radius: var(--piano-radius-full);
    cursor: pointer;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: rgba(220, 38, 38, 0.1);
      color: #dc2626;
    }
  }

  // Alerts
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
    transition: background 0.2s, transform 0.1s, opacity 0.2s;
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
}
</style>