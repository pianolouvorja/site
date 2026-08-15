<script setup lang="ts">
  import { teamAreas, teamOrgUrl } from '~/data/team'
</script>

<template>
  <section id="team" class="team">
    <div class="team__container">
      <div class="team__header">
        <span class="team__eyebrow">{{ $t('team.eyebrow') }}</span>
        <h2 class="team__title">
          {{ $t('team.title') }}
        </h2>
        <p class="team__subtitle">
          {{ $t('team.subtitle') }}
        </p>
      </div>

      <div class="team__grid">
        <article v-for="area in teamAreas" :key="area.id" class="team__card">
          <div class="team__card-head">
            <i :class="area.icon" aria-hidden="true" />
            <h3 class="team__card-title">
              {{ $t(`team.areas.${area.id}.title`) }}
            </h3>
          </div>
          <p class="team__card-text">
            {{ $t(`team.areas.${area.id}.description`) }}
          </p>
          <ul class="team__stack" :aria-label="$t('team.work.title')">
            <li v-for="tech in area.stack" :key="tech" class="team__chip">
              {{ tech }}
            </li>
          </ul>
        </article>
      </div>

      <div class="team__work">
        <h3 class="team__work-title">
          {{ $t('team.work.title') }}
        </h3>
        <p class="team__work-text">
          {{ $t('team.work.text') }}
        </p>
        <a :href="teamOrgUrl" class="team__cta" target="_blank" rel="noopener noreferrer">
          {{ $t('team.cta') }}
          <i class="ti ti-arrow-right" aria-hidden="true" />
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .team {
    padding: 6rem 1.5rem;
    background: var(--piano-white);
    position: relative;
    overflow: hidden;

    &__container {
      max-width: 1100px;
      margin: 0 auto;
    }

    &__header {
      text-align: center;
      max-width: 720px;
      margin: 0 auto 3.5rem;
    }

    &__eyebrow {
      display: inline-block;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--piano-accent);
      margin-bottom: 0.75rem;
    }

    &__title {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 800;
      color: var(--piano-text-primary);
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    &__subtitle {
      font-size: 1.05rem;
      color: var(--piano-text-secondary);
      line-height: 1.7;
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 3.5rem;
    }

    &__card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.75rem 1.5rem;
      background: var(--piano-bg-secondary);
      border: 1px solid var(--piano-border-subtle);
      border-radius: var(--piano-radius-lg);
      box-shadow: var(--piano-shadow-sm);
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--piano-shadow-lg);
      }
    }

    &__card-head {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      i {
        font-size: 1.75rem;
        color: var(--piano-accent);
        flex-shrink: 0;
      }
    }

    &__card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--piano-text-primary);
    }

    &__card-text {
      font-size: 0.95rem;
      color: var(--piano-text-secondary);
      line-height: 1.6;
      flex-grow: 1;
    }

    &__stack {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    &__chip {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      background: var(--piano-gray-100);
      color: var(--piano-text-secondary);
    }

    &__work {
      text-align: center;
      max-width: 640px;
      margin: 0 auto;
      padding: 2.25rem 2rem;
      background: var(--piano-gray-100);
      border-radius: var(--piano-radius-lg);
    }

    &__work-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--piano-text-primary);
      margin-bottom: 0.5rem;
    }

    &__work-text {
      font-size: 0.95rem;
      color: var(--piano-text-secondary);
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }

    &__cta {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--piano-accent);
      text-decoration: none;
      transition: gap 0.2s ease;

      &:hover {
        gap: 0.75rem;
      }
    }
  }

  @media (max-width: 900px) {
    .team {
      &__grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }

  @media (max-width: 600px) {
    .team {
      &__grid {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
