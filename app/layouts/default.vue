<template>
  <div class="site-layout">
    <a href="#main-content" class="skip-link">
      {{ $t('common.skipToContent') }}
    </a>
    <TheHeader />
    <main id="main-content" tabindex="-1">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
  // Skip-to-content link uses $t in template; no script-level i18n needed
</script>

<style scoped>
  .site-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    outline: none;
  }

  /* WCAG 2.4.1: Skip to content link — visually hidden until focused */
  .skip-link {
    position: absolute;
    top: -100%;
    left: 0;
    z-index: 10000;
    padding: 0.75rem 1.5rem;
    background: #0d1b2a;
    color: #fff;
    font-weight: 600;
    text-decoration: none;
    border-radius: 0 0 0.5rem 0;
  }

  .skip-link:focus {
    top: 0;
  }
</style>
