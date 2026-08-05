<script setup lang="ts">
  import { computed } from 'vue'

  /**
   * Renders a single legal-page body item.
   * - Plain text → <p>{{ message }}</p>
   * - Text with {link} placeholder → <p> with <a> injected at placeholder
   */
  const props = defineProps<{
    message: string
    linkUrl?: string
    linkText?: string
    external?: boolean
    paragraphClass?: string
  }>()

  const text = computed(() => String(props.message ?? ''))

  const parts = computed(() => {
    const t = text.value
    if (!t.includes('{link}')) return null
    const idx = t.indexOf('{link}')
    return {
      before: t.slice(0, idx),
      after: t.slice(idx + 6),
    }
  })

  // Lines starting with "N.N" are subsection headers
  // Stryker disable next-line Regex: equivalent mutation (.test() partial match)
  const isSubsection = computed(() => /^\d+\.\d+/.test(text.value))
  const computedClass = computed(() => {
    if (props.paragraphClass) return props.paragraphClass
    return isSubsection.value ? 'legal-page__subsection' : undefined
  })
</script>

<template>
  <p v-if="parts" :class="computedClass">
    {{ parts.before
    }}<a
      :href="linkUrl"
      :target="external ? '_blank' : undefined"
      :rel="external ? 'noopener' : undefined"
      >{{ linkText }}</a
    >{{ parts.after }}
  </p>
  <p v-else :class="computedClass">
    {{ text }}
  </p>
</template>
