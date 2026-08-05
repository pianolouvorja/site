<script setup lang="ts">
  import { steps } from '~/data/site'
</script>

<template>
  <section id="how-it-works" class="how">
    <div class="how__container">
      <div class="how__header">
        <span class="how__eyebrow">{{ $t('how.eyebrow') }}</span>
        <h2 class="how__title">
          {{ $t('how.title') }}
        </h2>
        <p class="how__description">
          {{ $t('how.description') }}
        </p>
      </div>

      <div class="how__timeline">
        <div class="how__line" />

        <div
          v-for="(step, i) in steps"
          :key="step.num"
          data-testid="step"
          class="how__step"
          :class="{ 'how__step--reverse': i % 2 === 1 }"
        >
          <div class="how__step-content">
            <h3 data-testid="step-title" class="how__step-title">
              {{ $t(`how.steps.${step.num}.title`) }}
            </h3>
            <p class="how__step-desc">
              {{ $t(`how.steps.${step.num}.desc`) }}
            </p>
          </div>
          <div class="how__step-num">
            <span>{{ step.num }}</span>
          </div>
          <div class="how__step-spacer" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .how {
    padding: 6rem 1.5rem;
    background: var(--piano-white);

    &__container {
      max-width: 1000px;
      margin: 0 auto;
    }

    &__header {
      text-align: center;
      max-width: 560px;
      margin: 0 auto 4rem;
    }

    &__eyebrow {
      display: inline-block;
      color: var(--piano-blue);
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.75rem;
    }

    &__title {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--piano-text-primary);
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    &__description {
      font-size: 1.1rem;
      color: var(--piano-text-secondary);
    }

    &__timeline {
      position: relative;
    }

    &__line {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, var(--piano-blue) 0%, var(--piano-cyan) 100%);
      transform: translateX(-50%);
    }

    &__step {
      display: grid;
      grid-template-columns: 1fr 80px 1fr;
      align-items: center;
      margin-bottom: 2.5rem;

      &--reverse {
        .how__step-content {
          grid-column: 3;
          text-align: left;
        }

        .how__step-spacer {
          grid-column: 1;
        }
      }

      &-content {
        grid-column: 1;
        text-align: right;
        padding-right: 2rem;
      }
    }

    &__step-num {
      grid-column: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;

      span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--piano-bg-accent);
        color: #fff;
        font-size: 1.5rem;
        font-weight: 800;
        box-shadow: 0 4px 16px rgba(0, 193, 230, 0.4);
        border: 4px solid #fff;
      }
    }

    &__step-spacer {
      grid-column: 3;
    }

    &__step-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--piano-text-primary);
      margin-bottom: 0.5rem;
    }

    &__step-desc {
      font-size: 0.95rem;
      color: var(--piano-text-secondary);
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      &__line {
        left: 28px;
      }

      &__step {
        grid-template-columns: 56px 1fr;
        gap: 1.25rem;

        &--reverse {
          .how__step-content {
            grid-column: 2;
            text-align: left;
            padding-right: 0;
          }

          .how__step-spacer {
            display: none;
          }
        }
      }

      &__step-content {
        grid-column: 2;
        text-align: left;
        padding-right: 0;
      }

      &__step-num {
        grid-column: 1;
      }

      &__step-spacer {
        display: none;
      }

      &__title {
        font-size: 2rem;
      }
    }
  }
</style>
