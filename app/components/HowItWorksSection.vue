<script setup lang="ts">
  import { steps } from '~/data/site'
</script>

<template>
  <section id="how-it-works" class="how">
    <div class="how__container">
      <h2 class="how__title">Como funciona</h2>

      <div class="how__steps">
        <div v-for="step in steps" :key="step.num" data-testid="step" class="how__step">
          <span class="how__step-num">{{ step.num }}</span>
          <h3 data-testid="step-title" class="how__step-title">
            {{ step.title }}
          </h3>
          <p class="how__step-desc">
            {{ step.desc }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .how {
    padding: 5rem 1.5rem;
    background: #fff;

    &__container {
      max-width: 1000px;
      margin: 0 auto;
    }

    &__title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a237e;
      margin-bottom: 3rem;
    }

    &__steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2.5rem;
    }

    &__step {
      text-align: center;

      &:hover {
        transform: translateY(-4px);
      }
    }

    &__step-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #1a237e;
      color: #fff;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    &__step-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1a237e;
      margin-bottom: 0.5rem;
    }

    &__step-desc {
      font-size: 0.95rem;
      color: #616161;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      &__steps {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      &__title {
        font-size: 2rem;
      }
    }
  }
</style>
