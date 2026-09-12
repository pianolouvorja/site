<script setup lang="ts">
  import { communityChannels, communityJoinUrl, communityMembers } from '~/data/community'

  const roleIcon: Record<string, string> = {
    tester: 'ti ti-bug',
    enthusiast: 'ti ti-sparkles',
    suggester: 'ti ti-lightbulb',
  }

  function initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
  }
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
          <span class="community__avatar" :class="`community__avatar--${member.role}`">
            {{ initials(member.name) }}
          </span>
          <span class="community__name">{{ member.name }}</span>
          <span class="community__role">
            <i :class="roleIcon[member.role]" aria-hidden="true" />
            {{ $t(`community.roles.${member.role}`) }}
          </span>
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

      <a :href="communityJoinUrl" class="community__spot" target="_blank" rel="noopener noreferrer">
        <span class="community__spot-plus" aria-hidden="true">+</span>
        <span class="community__spot-text">{{ $t('community.spot') }}</span>
      </a>

      <ul class="community__channels">
        <li v-for="channel in communityChannels" :key="channel.id">
          <a
            :href="channel.url"
            class="community__channel"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i :class="channel.icon" aria-hidden="true" />
            {{ $t(`community.channels.${channel.id}`) }}
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
      padding: 1.75rem 1rem;
      border: 1px solid rgba(128, 128, 128, 0.25);
      border-radius: 12px;
      transition:
        border-color 0.2s ease,
        transform 0.2s ease;

      &:hover {
        border-color: rgba(128, 128, 128, 0.5);
        transform: translateY(-2px);
      }
    }

    &__avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 50%;
      font-weight: 700;
      font-size: 1.125rem;
      color: #fff;
      background: #444;
      margin-bottom: 0.5rem;

      &--tester {
        background: #4a6da7;
      }

      &--enthusiast {
        background: #7a5ba6;
      }

      &--suggester {
        background: #5a8a5a;
      }
    }

    &__name {
      font-weight: 600;
    }

    &__role {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      background: rgba(128, 128, 128, 0.12);
    }

    &__since {
      font-size: 0.8125rem;
      opacity: 0.75;
      margin-top: 0.25rem;
    }

    &__link {
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    &__spot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1.75rem 1rem;
      border: 1px dashed rgba(128, 128, 128, 0.5);
      border-radius: 12px;
      text-decoration: none;
      transition:
        border-color 0.2s ease,
        transform 0.2s ease;

      &:hover {
        border-color: currentColor;
        transform: translateY(-2px);
      }
    }

    &__spot-plus {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 50%;
      border: 1px dashed rgba(128, 128, 128, 0.5);
      font-size: 1.5rem;
      font-weight: 300;
      line-height: 1;
    }

    &__spot-text {
      font-size: 0.875rem;
      font-weight: 500;
    }

    &__channels {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem;
    }

    &__channel {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.125rem;
      border: 1px solid currentColor;
      border-radius: 999px;
      font-size: 0.9375rem;
      font-weight: 500;
      text-decoration: none;
      opacity: 0.85;

      &:hover {
        opacity: 1;
      }
    }

    &__cta {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
      width: 100%;
      max-width: 360px;
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
