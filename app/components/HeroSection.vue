<template>
  <div class="hero">
    <div class="hero-content">
      <h1 class="hero-title">PIANO LouvorJA</h1>
      <p data-testid="hero-subtitle" class="hero-tagline">
        Gerenciamento de culto na web. Simples, rapido, completo.
      </p>
      <div class="hero-actions">
        <a data-testid="hero-cta" href="https://app.pianolouvorja.com.br" class="hero-cta">
          Acessar plataforma
        </a>
        <a data-testid="hero-secondary" href="#features" class="hero-secondary">
          Ver funcionalidades
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .hero {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 4rem 1.5rem;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    color: #fff;
  }

  .hero-content {
    max-width: 700px;
  }

  .hero-title {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
  }

  .hero-tagline {
    font-size: 1.25rem;
    opacity: 0.9;
    margin-bottom: 2rem;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .hero-cta {
    display: inline-block;
    padding: 0.875rem 2rem;
    background: #e94560;
    color: #fff;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1.1rem;
    text-decoration: none;
    transition: background 0.2s;
  }

  .hero-cta:hover {
    background: #c73e54;
  }

  .hero-secondary {
    display: inline-block;
    padding: 0.875rem 2rem;
    background: transparent;
    color: #fff;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 8px;
    font-weight: 600;
    font-size: 1.1rem;
    text-decoration: none;
    transition:
      border-color 0.2s,
      background 0.2s;
  }

  .hero-secondary:hover {
    border-color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 600px) {
    .hero-title {
      font-size: 2rem;
    }

    .hero-tagline {
      font-size: 1rem;
    }
  }
</style>
