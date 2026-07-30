<script setup lang="ts">
  import { siteConfig } from '~/data/site'

  const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__container">
      <p class="footer__brand">
        {{ siteConfig.name }}
      </p>
      <p class="footer__copyright">
        &copy; {{ currentYear }} {{ siteConfig.name }}. Todos os direitos reservados.
      </p>
      <p class="footer__credits">
        Desenvolvido por
        <a
          data-testid="footer-portfolio"
          href="https://portfoliodev-blush-pi.vercel.app/"
          class="footer__portfolio-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Rafael Zendron
        </a>
      </p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
  .footer {
    background: #0d1b4a;
    color: #e3f2fd;
    padding: 2.5rem 1.5rem;

    &__container {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }

    &__brand {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    &__copyright {
      font-size: 0.9rem;
      color: #90caf9;
      margin-bottom: 0.5rem;
    }

    &__credits {
      font-size: 0.85rem;
      color: #64b5f6;
    }

    &__portfolio-link {
      color: #64b5f6;
      text-decoration: underline;

      &:hover {
        color: #bbdefb;
      }
    }
  }
</style>
