<script setup lang="ts">
  import { siteConfig, navLinks } from '~/data/site'

  const route = useRoute()
  const localePath = useLocalePath()

  // Home e qualquer rota raiz de locale: '/', '/en', '/es'
  const isHomePage = computed(() => {
    const path = route.path.replace(/\/$/, '')
    return path === '' || path === '/en' || path === '/es'
  })

  function navHref(href: string): string {
    // Hash puro (ex: '#features')
    if (href.startsWith('#')) {
      return isHomePage.value ? href : `${localePath('/')}${href}`
    }
    // Hash com barra (ex: '/#features')
    if (href.startsWith('/#')) {
      const hash = href.slice(1)
      return isHomePage.value ? hash : `${localePath('/')}${hash}`
    }
    // Rotas internas
    return localePath(href)
  }

  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: 'ti-brand-github', href: 'https://github.com/pianolouvorja', label: 'GitHub' },
  ]
</script>

<template>
  <footer class="footer">
    <div class="footer__container">
      <div class="footer__top">
        <div class="footer__brand">
          <!-- Logo + Louvor JA (igual ao webapp) -->
          <div class="footer__logo-block">
            <img
              src="/brand/logo-louvor-ja.svg"
              alt="Louvor JA"
              class="footer__logo"
              width="48"
              height="48"
            />
            <div class="footer__brand-text">
              <span class="footer__brand-louvor">Louvor</span>
              <span class="footer__brand-ja">JA</span>
            </div>
          </div>

          <!-- Codename PIANO -->
          <img src="/brand/codename-piano.svg" alt="codename PIANO" class="footer__codename" />

          <p class="footer__tagline">
            {{ $t('footer.tagline') }}
          </p>

          <div class="footer__social">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              class="footer__social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i :class="`ti ${social.icon}`" />
            </a>
          </div>

          <div style="margin-top: 1.5rem; width: 100%">
            <DonateButton variant="inline" />
          </div>
        </div>

        <nav class="footer__nav" :aria-label="$t('footer.navLabel')">
          <span class="footer__nav-title">{{ $t('footer.navTitle') }}</span>
          <ul>
            <li v-for="link in navLinks" :key="link.href">
              <NuxtLink :to="navHref(link.href)">
                {{ $t(link.i18nKey) }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <nav class="footer__nav" :aria-label="$t('footer.legalNavLabel')">
          <span class="footer__nav-title">{{ $t('footer.legalNavTitle') }}</span>
          <ul>
            <li>
              <NuxtLink :to="localePath('/privacy')">
                {{ $t('footer.privacy') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/terms')">
                {{ $t('footer.terms') }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>

      <div class="footer__bottom">
        <p class="footer__copyright">
          &copy; {{ currentYear }} {{ siteConfig.name }}. {{ $t('footer.rights') }}
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
  .footer {
    background: var(--piano-dark);
    color: rgba(255, 255, 255, 0.7);
    padding: 4rem 1.5rem 2rem;

    &__container {
      max-width: 1100px;
      margin: 0 auto;
    }

    &__top {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 3rem;
      padding-bottom: 2.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    &__brand {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    &__logo-block {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    &__logo {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }

    &__brand-text {
      display: flex;
      gap: 0.25rem;
      font-size: 1.5rem;
      font-weight: 700;
    }

    &__brand-louvor {
      color: #fff;
    }
    &__brand-ja {
      color: var(--piano-cyan-light);
      font-weight: 400;
    }

    &__codename {
      height: 24px;
      width: auto;
      filter: brightness(0) invert(1);
      opacity: 0.6;
    }

    &__tagline {
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0;
      max-width: 320px;
    }

    &__social {
      display: flex;
      gap: 0.625rem;
    }

    &__social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--piano-radius-sm);
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: all 0.2s;

      &:hover {
        background: var(--piano-cyan);
        color: #fff;
      }

      i {
        font-size: 1.2rem;
      }
    }

    &__nav-title {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1rem;
    }

    &__nav ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 0.625rem;
      }

      a {
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        font-size: 0.95rem;
        transition: color 0.2s;

        &:hover {
          color: var(--piano-cyan);
        }
      }
    }

    &__bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    &__copyright {
      font-size: 0.85rem;
      margin: 0;
    }

    &__credits {
      font-size: 0.85rem;
      margin: 0;
    }

    &__portfolio-link {
      color: var(--piano-cyan);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;

      &:hover {
        color: var(--piano-cyan-light);
        text-decoration: underline;
      }
    }

    @media (max-width: 600px) {
      &__top {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      &__bottom {
        flex-direction: column;
        text-align: center;
      }
    }

    @media (min-width: 601px) and (max-width: 960px) {
      &__top {
        grid-template-columns: 1fr 1fr;
      }

      &__brand {
        grid-column: 1 / -1;
      }
    }
  }
</style>
