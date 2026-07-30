<script setup lang="ts">
  import { features } from '~/data/site'
</script>

<template>
  <section id="features" class="features">
    <div class="features__container">
      <h2 class="features__title">Funcionalidades</h2>
      <div class="features__grid">
        <div
          v-for="feature in features"
          :key="feature.id"
          data-testid="feature-card"
          class="features__card"
        >
          <div class="features__icon">
            <i :class="['ti', feature.icon]" />
          </div>
          <h3 class="features__name">
            {{ feature.title }}
          </h3>
          <p class="features__description">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .features {
    padding: 4rem 1.5rem;
    background: #f8fafc;

    &__container {
      max-width: 1200px;
      margin: 0 auto;
    }

    &__title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 3rem;
      color: #1a1a2e;
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }

    &__card {
      background: #fff;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition:
        transform 0.2s,
        box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }
    }

    &__icon {
      margin-bottom: 1rem;

      i {
        font-size: 3rem;
        color: #6366f1;
      }
    }

    &__name {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #1a1a2e;
    }

    &__description {
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.5;
    }

    @media (max-width: 960px) {
      &__grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }

      &__title {
        font-size: 2rem;
      }
    }

    @media (max-width: 600px) {
      &__grid {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
