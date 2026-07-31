<script setup lang="ts">
  import { siteConfig } from '~/data/site'
</script>

<template>
  <section id="hero" class="hero">
    <div class="hero__glow hero__glow--cyan" />
    <div class="hero__glow hero__glow--yellow" />

    <div class="hero__container">
      <div class="hero__content">
        <span class="hero__badge">
          <i class="ti ti-sparkles" />
          {{ $t('hero.badge') }}
        </span>

        <h1 class="hero__title">
          {{ $t('hero.title') }}<br />
          <span class="hero__title-accent">{{ $t('hero.titleHighlight') }}</span>
        </h1>

        <p data-testid="hero-subtitle" class="hero__subtitle">
          {{ $t('hero.subtitle') }}
        </p>

        <div class="hero__actions">
          <a data-testid="hero-cta" :href="siteConfig.appUrl" class="hero__cta hero__cta--primary">
            <i class="ti ti-login" />
            {{ $t('hero.ctaPrimary') }}
          </a>
          <a data-testid="hero-secondary" href="#platforms" class="hero__cta hero__cta--secondary">
            <i class="ti ti-devices" />
            {{ $t('hero.ctaSecondary') }}
          </a>
        </div>

        <div class="hero__meta">
          <div class="hero__meta-item">
            <i class="ti ti-bolt" />
            {{ $t('hero.meta.noInstall') }}
          </div>
          <div class="hero__meta-item">
            <i class="ti ti-devices" />
            {{ $t('hero.meta.anyDevice') }}
          </div>
          <div class="hero__meta-item">
            <i class="ti ti-award" />
            {{ $t('hero.meta.openSource') }}
          </div>
        </div>
      </div>

      <!-- Preview: replica fiel do webapp (AppShell) -->
      <div class="hero__preview">
        <div class="hero__preview-window" data-testid="hero-preview-window">
          <!-- Barra de janela estilo desktop -->
          <div class="hero__preview-bar"><span /><span /><span /></div>

          <!-- App header (espelha AppShell do webapp) -->
          <div class="hero__preview-header">
            <div class="hero__preview-brand">
              <img src="/brand/logo-louvor-ja.svg" alt="" class="hero__preview-logo" />
              <span class="hero__preview-brand-text">
                <span class="hero__preview-louvor">Louvor</span>
                <span class="hero__preview-ja">JA</span>
              </span>
            </div>
            <div class="hero__preview-codename-block">
              <img src="/brand/codename-piano.svg" alt="" class="hero__preview-codename" />
              <span class="hero__preview-version">1.15.2</span>
            </div>
          </div>

          <!-- Corpo do app com gradiente (igual ao webapp) -->
          <div class="hero__preview-body">
            <!-- Hino atual em destaque -->
            <div class="hero__preview-card hero__preview-card--hymn">
              <div class="hero__preview-card-icon hero__preview-card-icon--cyan">
                <i class="ti ti-music" />
              </div>
              <div class="hero__preview-card-info">
                <span class="hero__preview-card-label">Hino atual</span>
                <span class="hero__preview-card-title">Nº 15 — Divino Comigo</span>
              </div>
              <span class="hero__preview-card-badge">Ativo</span>
            </div>

            <!-- Próximo item -->
            <div class="hero__preview-card hero__preview-card--liturgy">
              <div class="hero__preview-card-icon hero__preview-card-icon--yellow">
                <i class="ti ti-book-2" />
              </div>
              <div class="hero__preview-card-info">
                <span class="hero__preview-card-label">Próximo</span>
                <span class="hero__preview-card-title">Boas-Vindas e Louvor</span>
              </div>
              <i class="ti ti-chevron-right hero__preview-card-arrow" />
            </div>

            <!-- Cronômetro -->
            <div class="hero__preview-timer">
              <div class="hero__preview-timer-label">
                <i class="ti ti-clock-hour-4" />
                <span>Tempo decorrido</span>
              </div>
              <span class="hero__preview-timer-value">10:32</span>
            </div>
          </div>

          <!-- Dock inferior (igual ao webapp) -->
          <div class="hero__preview-dock">
            <div class="hero__preview-dock-item hero__preview-dock-item--active">
              <i class="ti ti-home" />
            </div>
            <div class="hero__preview-dock-item">
              <i class="ti ti-book-2" />
            </div>
            <div class="hero__preview-dock-item">
              <i class="ti ti-music" />
            </div>
            <div class="hero__preview-dock-item">
              <i class="ti ti-clipboard-text" />
            </div>
            <div class="hero__preview-dock-item">
              <i class="ti ti-stopwatch" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    background: var(--piano-bg-primary);
    padding: 8rem 1.5rem 4rem;

    &__glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.35;
      pointer-events: none;

      &--cyan {
        width: 500px;
        height: 500px;
        background: var(--piano-cyan);
        top: -100px;
        right: -100px;
      }

      &--yellow {
        width: 400px;
        height: 400px;
        background: var(--piano-yellow);
        bottom: -150px;
        left: -100px;
        opacity: 0.15;
      }
    }

    &__container {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      width: 100%;
    }

    &__badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 193, 230, 0.15);
      border: 1px solid rgba(0, 193, 230, 0.3);
      color: var(--piano-cyan-light);
      padding: 0.375rem 1rem;
      border-radius: var(--piano-radius-full);
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
    }

    &__title {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      color: #fff;
      margin-bottom: 1.25rem;
      letter-spacing: -0.02em;
    }

    &__title-accent {
      background: linear-gradient(135deg, var(--piano-cyan) 0%, var(--piano-yellow) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    &__subtitle {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.7;
      max-width: 480px;
      margin-bottom: 2rem;
    }

    &__actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
    }

    &__cta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: var(--piano-radius-full);
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      transition:
        transform 0.2s,
        box-shadow 0.2s;

      &--primary {
        background: var(--piano-bg-accent);
        color: #fff;
        box-shadow: 0 4px 20px rgba(0, 193, 230, 0.4);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 193, 230, 0.55);
        }
      }

      &--secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);

        &:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }
      }

      i {
        font-size: 1.2rem;
      }
    }

    &__meta {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    &__meta-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: rgba(255, 255, 255, 0.65);
      font-size: 0.85rem;

      i {
        font-size: 1.05rem;
        color: var(--piano-cyan);
      }
    }

    /* ========== PREVIEW (espelha fielmente o webapp) ========== */
    &__preview {
      display: flex;
      justify-content: center;
    }

    &__preview-window {
      width: 100%;
      max-width: 420px;
      background: var(--piano-dark);
      border-radius: var(--piano-radius-lg);
      box-shadow:
        0 24px 64px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(0, 193, 230, 0.1);
      overflow: hidden;
      transform: perspective(1000px) rotateY(-3deg) rotateX(2deg);
    }

    &__preview-bar {
      display: flex;
      gap: 0.375rem;
      padding: 0.625rem 1rem;
      background: rgba(0, 0, 0, 0.4);

      span {
        width: 11px;
        height: 11px;
        border-radius: 50%;

        &:nth-child(1) {
          background: #ff5f57;
        }
        &:nth-child(2) {
          background: #ffbd2e;
        }
        &:nth-child(3) {
          background: #28ca42;
        }
      }
    }

    /* App header — espelha AppShell */
    &__preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: linear-gradient(135deg, rgba(16, 67, 140, 0.4) 0%, rgba(10, 23, 51, 0.6) 100%);
      border-bottom: 1px solid rgba(0, 193, 230, 0.15);
    }

    &__preview-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    &__preview-logo {
      width: 28px;
      height: 28px;
      border-radius: 50%;
    }

    &__preview-brand-text {
      display: flex;
      gap: 0.25rem;
      font-size: 1.05rem;
      font-weight: 700;
    }

    &__preview-louvor {
      color: #fff;
    }
    &__preview-ja {
      color: var(--piano-cyan-light);
      font-weight: 400;
    }

    &__preview-codename-block {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.1rem;
    }

    &__preview-codename {
      height: 16px;
      width: auto;
      filter: brightness(0) invert(1);
      opacity: 0.85;
    }

    &__preview-version {
      font-size: 0.55rem;
      color: rgba(255, 255, 255, 0.3);
      letter-spacing: 0.05em;
    }

    /* Corpo do app — gradiente como o webapp */
    &__preview-body {
      padding: 1rem;
      background: linear-gradient(180deg, #0a1733 0%, #061026 100%);
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      min-height: 240px;
    }

    &__preview-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: var(--piano-radius-md);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    &__preview-card--hymn {
      background: rgba(0, 193, 230, 0.1);
      border-color: rgba(0, 193, 230, 0.25);
    }

    &__preview-card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--piano-radius-sm);
      flex-shrink: 0;

      i {
        font-size: 1.25rem;
        color: #fff;
      }

      &--cyan {
        background: linear-gradient(135deg, var(--piano-cyan) 0%, #0098b3 100%);
      }

      &--yellow {
        background: linear-gradient(135deg, var(--piano-yellow) 0%, #d9a800 100%);
      }
    }

    &__preview-card-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    &__preview-card-label {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    &__preview-card-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__preview-card-badge {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--piano-cyan);
      background: rgba(0, 193, 230, 0.15);
      padding: 0.25rem 0.5rem;
      border-radius: var(--piano-radius-full);
      flex-shrink: 0;
    }

    &__preview-card-arrow {
      color: rgba(255, 255, 255, 0.4);
      font-size: 1.1rem;
    }

    /* Cronômetro */
    &__preview-timer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-radius: var(--piano-radius-md);
      background: rgba(252, 206, 2, 0.08);
      border: 1px solid rgba(252, 206, 2, 0.2);
      margin-top: auto;
    }

    &__preview-timer-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);

      i {
        color: var(--piano-yellow);
      }
    }

    &__preview-timer-value {
      font-family: 'Plus Jakarta Sans', monospace;
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--piano-yellow);
      letter-spacing: 0.02em;
    }

    /* Dock inferior */
    &__preview-dock {
      display: flex;
      justify-content: space-around;
      padding: 0.625rem 0.5rem;
      background: rgba(0, 0, 0, 0.5);
      border-top: 1px solid rgba(0, 193, 230, 0.1);
    }

    &__preview-dock-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--piano-radius-sm);
      color: rgba(255, 255, 255, 0.4);
      transition: all 0.2s;

      i {
        font-size: 1.15rem;
      }

      &--active {
        color: var(--piano-cyan);
        background: rgba(0, 193, 230, 0.15);
      }
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 960px) {
      &__container {
        grid-template-columns: 1fr;
        gap: 2.5rem;
        text-align: center;
      }

      &__content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      &__badge {
        align-self: center;
      }

      &__actions {
        justify-content: center;
      }

      &__meta {
        justify-content: center;
      }

      &__subtitle {
        margin-left: auto;
        margin-right: auto;
      }

      &__preview {
        order: -1;
      }
    }

    @media (max-width: 600px) {
      padding: 6rem 1.25rem 3rem;

      &__title {
        font-size: 2.25rem;
      }

      &__subtitle {
        font-size: 1.05rem;
      }

      &__actions {
        flex-direction: column;
        width: 100%;
      }

      &__cta {
        justify-content: center;
      }

      &__meta {
        gap: 0.875rem;
        flex-direction: column;
      }

      /* Mobile: preview sem perspectiva, ocupa largura */
      &__preview-window {
        transform: none;
        max-width: 340px;
      }

      /* Dock compacto em mobile */
      &__preview-dock-item {
        width: 32px;
        height: 32px;

        i {
          font-size: 1rem;
        }
      }
    }
  }
</style>
