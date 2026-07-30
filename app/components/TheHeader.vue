<script setup lang="ts">
  import { ref } from 'vue'
  import { navLinks, siteConfig } from '~/data/site'

  const mobileMenuOpen = ref(false)

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  function closeMobileMenu() {
    mobileMenuOpen.value = false
  }
</script>

<template>
  <header class="header">
    <div class="header__container">
      <a href="#hero" class="header__logo" @click="closeMobileMenu">
        <span class="header__logo-bold">PIANO</span>
        <span class="header__logo-light">LouvorJA</span>
      </a>

      <nav class="header__nav-desktop">
        <a v-for="link in navLinks" :key="link.href" :href="link.href" class="header__nav-link">
          {{ link.label }}
        </a>
      </nav>

      <a data-testid="header-cta" :href="siteConfig.appUrl" class="header__cta"> Acessar app </a>

      <button
        data-testid="header-menu-toggle"
        class="header__menu-toggle"
        :aria-expanded="mobileMenuOpen"
        aria-label="Menu"
        @click="toggleMobileMenu"
      >
        <span />
        <span />
        <span />
      </button>
    </div>

    <nav v-if="mobileMenuOpen" data-testid="header-nav-mobile" class="header__nav-mobile">
      <a
        v-for="link in navLinks"
        :key="link.href"
        :href="link.href"
        class="header__nav-mobile-link"
        @click="closeMobileMenu"
      >
        {{ link.label }}
      </a>
    </nav>
  </header>
</template>

<style scoped lang="scss">
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(26, 35, 126, 0.95);
    backdrop-filter: blur(10px);

    &__container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      gap: 1rem;
    }

    &__logo {
      font-size: 1.5rem;
      font-weight: 700;
      text-decoration: none;
      display: flex;
      gap: 0.25rem;

      &-bold {
        color: #fff;
      }
      &-light {
        color: #90caf9;
        font-weight: 400;
      }
    }

    &__nav-desktop {
      display: flex;
      gap: 2rem;
    }

    &__nav-link {
      color: #e3f2fd;
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.2s;

      &:hover {
        color: #90caf9;
      }
    }

    &__cta {
      background: #2196f3;
      color: #fff;
      padding: 0.5rem 1.25rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;

      &:hover {
        background: #1976d2;
      }
    }

    &__menu-toggle {
      display: none;
      flex-direction: column;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;

      span {
        width: 24px;
        height: 2px;
        background: #fff;
        border-radius: 2px;
      }
    }

    &__nav-mobile {
      display: none;
      flex-direction: column;
      padding: 1rem 1.5rem;
      gap: 0.5rem;
    }

    &__nav-mobile-link {
      color: #e3f2fd;
      text-decoration: none;
      padding: 0.5rem 0;
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      &__nav-desktop {
        display: none;
      }
      &__cta {
        display: none;
      }
      &__menu-toggle {
        display: flex;
      }
      &__nav-mobile {
        display: flex;
      }
    }
  }
</style>
