<script setup lang="ts">
  const stats = [
    { num: '8+', key: 'features' },
    { num: '100%', key: 'free' },
    { num: '0', key: 'installs' },
    { num: 'PWA', key: 'offline' },
  ] as const
</script>

<template>
  <section class="stats">
    <div class="stats__container">
      <div v-for="stat in stats" :key="stat.key" data-testid="stat-item" class="stats__item">
        <span data-testid="stat-num" class="stats__num">{{ stat.num }}</span>
        <span class="stats__label">{{ $t(`stats.${stat.key}`) }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .stats {
    background: var(--piano-bg-accent);
    padding: 2.5rem 1.5rem;

    &__container {
      max-width: 1000px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    &__item {
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    &__num {
      font-size: 2.5rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
    }

    &__label {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
    }

    @media (max-width: 600px) {
      &__container {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
      }

      &__num {
        font-size: 2rem;
      }
    }
  }
</style>
