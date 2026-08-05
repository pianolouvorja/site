<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { navLinks, secondaryNavLinks, siteConfig } from '~/data/site'

  const { locale, locales, setLocale } = useI18n()
  const route = useRoute()
  const mobileMenuOpen = ref(false)
  const langMenuOpen = ref(false)
  const isScrolled = ref(false)
  const localePath = useLocalePath()

  // Home e qualquer rota raiz de locale: '/', '/en', '/es'
  const isHomePage = computed(() => {
    const path = route.path.replace(/\/$/, '')
    return path === '' || path === '/en' || path === '/es'
  })

  function navHref(href: string): string {
    // Hash puro (ex: '#features') — na mesma pagina, so preservar a hash
    if (href.startsWith('#')) {
      return isHomePage.value ? href : `${localePath('/')}${href}`
    }
    // Hash com barra (ex: '/#features')
    if (href.startsWith('/#')) {
      const hash = href.slice(1) // -> '#features'
      return isHomePage.value ? hash : `${localePath('/')}${hash}`
    }
    // Rotas internas (ex: /docs, /contact, /privacy)
    return localePath(href)
  }

  const availableLocales = computed(() => locales.value.filter((l) => l.code !== locale.value))

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  function closeMobileMenu() {
    mobileMenuOpen.value = false
  }

  function toggleLangMenu() {
    langMenuOpen.value = !langMenuOpen.value
  }

  function closeLangMenu() {
    langMenuOpen.value = false
  }

  type LocaleCode = 'pt-BR' | 'en' | 'es'

  function changeLocale(code: LocaleCode) {
    setLocale(code)
    closeLangMenu()
    closeMobileMenu()
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('.header__lang')) {
      closeLangMenu()
    }
  }

  function handleScroll() {
    isScrolled.value = window.scrollY > 20
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    document.removeEventListener('click', handleClickOutside)
  })
</script>

<template>
  <header class="header" :class="{ 'header--scrolled': isScrolled }">
    <div class="header__container">
      <!-- Esquerda: logo do app + "Louvor JA" (igual ao webapp) -->
      <NuxtLink :to="navHref('#hero')" class="header__brand-group" @click="closeMobileMenu">
        <img
          src="/brand/logo-louvor-ja.svg"
          alt="Louvor JA"
          class="header__logo"
          width="28"
          height="28"
        />
        <span class="header__brand">
          <span class="header__brand-louvor">Louvor</span>
          <span class="header__brand-ja">JA</span>
        </span>
      </NuxtLink>

      <!-- Centro: navegação desktop -->
      <nav class="header__nav-desktop" :aria-label="$t('nav.features')">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.href"
          :to="navHref(link.href)"
          class="header__nav-link"
        >
          {{ $t(link.i18nKey) }}
        </NuxtLink>
      </nav>

      <!-- Direita: codename PIANO + lang switcher + CTA -->
      <div class="header__header-end">
        <img src="/brand/codename-piano.svg" alt="" class="header__codename" />

        <!-- Language switcher -->
        <div class="header__lang">
          <button
            data-testid="header-lang-toggle"
            class="header__lang-btn"
            :aria-label="`${$t('nav.language')} — ${locale.toUpperCase()}`"
            :aria-expanded="langMenuOpen"
            @click.stop="toggleLangMenu"
          >
            <i class="ti ti-language" />
            <span class="header__lang-code">{{ locale.toUpperCase() }}</span>
          </button>
          <Transition name="lang-dropdown">
            <ul
              v-if="langMenuOpen"
              data-testid="header-lang-menu"
              class="header__lang-menu"
              role="menu"
            >
              <li v-for="l in availableLocales" :key="l.code" role="none">
                <button
                  role="menuitem"
                  class="header__lang-option"
                  :data-testid="`header-lang-${l.code}`"
                  @click="changeLocale(l.code)"
                >
                  {{ l.name }}
                </button>
              </li>
            </ul>
          </Transition>
        </div>

        <a
          data-testid="header-cta"
          :href="siteConfig.appUrl"
          class="header__cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="ti ti-login" />
          <span>{{ $t('nav.openApp') }}</span>
        </a>
      </div>

      <button
        data-testid="header-menu-toggle"
        class="header__menu-toggle"
        :class="{ 'header__menu-toggle--active': mobileMenuOpen }"
        :aria-expanded="mobileMenuOpen"
        aria-label="Menu"
        @click="toggleMobileMenu"
      >
        <span /><span /><span />
      </button>
    </div>

    <Transition name="mobile-menu">
      <nav v-if="mobileMenuOpen" data-testid="header-nav-mobile" class="header__nav-mobile">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.href"
          :to="navHref(link.href)"
          class="header__nav-mobile-link"
          @click="closeMobileMenu"
        >
          {{ $t(link.i18nKey) }}
        </NuxtLink>

        <!-- Secondary links (hidden on desktop header, shown on mobile) -->
        <NuxtLink
          v-for="link in secondaryNavLinks"
          :key="link.href"
          :to="navHref(link.href)"
          class="header__nav-mobile-link header__nav-mobile-link--secondary"
          @click="closeMobileMenu"
        >
          {{ $t(link.i18nKey) }}
        </NuxtLink>

        <!-- Language switcher mobile -->
        <div class="header__lang-mobile">
          <button
            v-for="l in availableLocales"
            :key="l.code"
            class="header__lang-mobile-btn"
            @click="changeLocale(l.code)"
          >
            <i class="ti ti-language" />
            {{ l.name }}
          </button>
        </div>

        <a
          :href="siteConfig.appUrl"
          class="header__nav-mobile-cta"
          target="_blank"
          rel="noopener noreferrer"
          @click="closeMobileMenu"
        >
          <i class="ti ti-login" />
          {{ $t('nav.openApp') }}
        </a>
      </nav>
    </Transition>
  </header>
</template>

<style scoped lang="scss">
  .header {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(16, 67, 140, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0, 193, 230, 0.15);
    transition:
      background 0.3s,
      box-shadow 0.3s;

    &--scrolled {
      background: rgba(10, 23, 51, 0.95);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    &__container {
      max-width: 976px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 1.5rem;
      gap: 1rem;
    }

    /* Logo + Louvor JA */
    &__brand-group {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      text-decoration: none;
      flex-shrink: 0;
    }

    &__logo {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
      border-radius: 50%;
    }

    &__brand {
      display: flex;
      gap: 0.25rem;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    &__brand-louvor {
      color: #fff;
    }

    &__brand-ja {
      color: var(--piano-cyan-light);
      font-weight: 400;
    }

    /* Codename PIANO */
    &__header-end {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    &__codename {
      height: 16px;
      width: auto;
      filter: brightness(0) invert(1);
    }

    /* Language switcher */
    &__lang {
      position: relative;

      &-btn {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.9);
        padding: 0.4rem 0.6rem;
        border-radius: var(--piano-radius-sm);
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 600;
        transition: all 0.2s;

        &:hover,
        &:focus-visible {
          background: rgba(0, 193, 230, 0.2);
          border-color: rgba(0, 193, 230, 0.4);
          color: #fff;
        }

        i {
          font-size: 1.05rem;
        }
      }

      &-code {
        min-width: 28px;
        text-align: center;
      }

      &-menu {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: rgba(10, 23, 51, 0.98);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(0, 193, 230, 0.2);
        border-radius: var(--piano-radius-md);
        padding: 0.375rem;
        min-width: 140px;
        list-style: none;
        margin: 0;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 101;
      }

      &-option {
        display: block;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.85);
        padding: 0.5rem 0.75rem;
        border-radius: var(--piano-radius-sm);
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.2s;

        &:hover,
        &:focus-visible {
          background: rgba(0, 193, 230, 0.15);
          color: #fff;
        }
      }
    }

    /* Language switcher mobile */
    &__lang-mobile {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem;

      &-btn {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.9);
        padding: 0.5rem 0.75rem;
        border-radius: var(--piano-radius-sm);
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 600;
        flex: 1;
        justify-content: center;

        &:hover {
          background: rgba(0, 193, 230, 0.2);
        }

        i {
          font-size: 1rem;
        }
      }
    }

    &__nav-desktop {
      display: flex;
      gap: 0.25rem;
      flex-wrap: nowrap;
      white-space: nowrap;
      overflow: hidden;
    }

    &__nav-link {
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0.5rem 0.7rem;
      border-radius: var(--piano-radius-sm);
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;

      &:hover,
      &:focus-visible {
        color: #fff;
        background: rgba(0, 193, 230, 0.15);
      }
    }

    &__cta {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      background: var(--piano-bg-accent);
      color: #fff;
      padding: 0.5rem 1.125rem;
      border-radius: var(--piano-radius-full);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 2px 12px rgba(0, 193, 230, 0.35);
      transition:
        transform 0.2s,
        box-shadow 0.2s;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 20px rgba(0, 193, 230, 0.5);
      }

      i {
        font-size: 1.05rem;
      }
    }

    &__menu-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      width: 36px;
      height: 36px;

      span {
        display: block;
        width: 24px;
        height: 2px;
        background: #fff;
        border-radius: 2px;
        transition: all 0.3s;
        transform-origin: center;
      }

      &--active {
        span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        span:nth-child(2) {
          opacity: 0;
        }

        span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
      }
    }

    &__nav-mobile {
      display: flex;
      flex-direction: column;
      padding: 1rem 1.5rem 1.5rem;
      gap: 0.25rem;
      background: rgba(10, 23, 51, 0.98);
      backdrop-filter: blur(16px);
    }

    &__nav-mobile-link {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      padding: 0.75rem 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      border-radius: var(--piano-radius-sm);
      transition: all 0.2s;

      &:hover {
        background: rgba(0, 193, 230, 0.12);
        color: var(--piano-cyan-light);
      }

      &--secondary {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 400;
      }
    }

    &__nav-mobile-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: var(--piano-bg-accent);
      color: #fff;
      padding: 0.75rem;
      border-radius: var(--piano-radius-sm);
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      margin-top: 0.5rem;

      i {
        font-size: 1.1rem;
      }
    }

    @media (max-width: 1280px) {
      &__codename {
        display: none;
      }
    }

    @media (max-width: 960px) {
      &__nav-desktop {
        display: none;
      }
    }

    @media (max-width: 768px) {
      &__cta {
        display: none;
      }

      &__menu-toggle {
        display: flex;
      }
    }
  }

  // Mobile menu transition
  .mobile-menu-enter-active,
  .mobile-menu-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .mobile-menu-enter-from,
  .mobile-menu-leave-to {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }

  .mobile-menu-enter-to,
  .mobile-menu-leave-from {
    opacity: 1;
    max-height: 500px;
  }

  // Lang dropdown transition
  .lang-dropdown-enter-active,
  .lang-dropdown-leave-active {
    transition: all 0.2s ease;
    overflow: hidden;
  }

  .lang-dropdown-enter-from,
  .lang-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
