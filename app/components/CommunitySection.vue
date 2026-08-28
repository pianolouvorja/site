<script setup lang="ts">
  import { communityJoinUrl, communityMembers } from '~/data/community'
</script>

<template>
  <section id="community" class="community">
    <div class="community__container">
      <div class="community__header">
        <span class="community__eyebrow">{{ $t('community.eyebrow') }}</span>
        <h2 class="community__title">
          {{ $t('community.title') }}
        </h2>
        <p class="community__subtitle">
          {{ $t('community.subtitle') }}
        </p>
      </div>

      <ul class="community__grid">
        <li v-for="member in communityMembers" :key="member.name" class="community__card">
          <i class="ti ti-heart-handshake" aria-hidden="true" />
          <span class="community__name">{{ member.name }}</span>
          <span class="community__role">{{ $t(`community.roles.${member.role}`) }}</span>
          <span class="community__since">
            {{ $t('community.since', { since: member.since }) }}
          </span>
          <a
            v-if="member.url"
            :href="member.url"
            class="community__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('community.link') }}
          </a>
        </li>
      </ul>

      <a :href="communityJoinUrl" class="community__cta" target="_blank" rel="noopener noreferrer">
        {{ $t('community.cta') }}
        <i class="ti ti-arrow-right" aria-hidden="true" />
      </a>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .community {
    padding: 5rem 1.5rem;

    &__container {
      max-width: 1200px;
      margin: 0 auto;
    }

    &__header {
      text-align: center;
      margin-bottom: 3rem;
    }

    &__eyebrow {
      display: block;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    &__title {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }

    &__subtitle {
      max-width: 640px;
      margin: 0 auto;
    }

    &__grid {
      list-style: none;
      padding: 0;
      margin: 0 0 2.5rem;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }

    &__card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      text-align: center;
      padding: 1.5rem 1rem;
      border: 1px solid rgba(128, 128, 128, 0.25);
      border-radius: 12px;
    }

    &__name {
      font-weight: 600;
      margin-top: 0.5rem;
    }

    &__role {
      font-size: 0.875rem;
    }

    &__since {
      font-size: 0.8125rem;
      opacity: 0.75;
    }

    &__link {
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    &__cta {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
      width: 100%;
      max-width: 360px;
      display: flex;
      margin: 0 auto;
      padding: 0.875rem 1.5rem;
      border-radius: 999px;
      font-weight: 600;
      text-decoration: none;
    }

    @media (max-width: 768px) {
      &__grid {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
