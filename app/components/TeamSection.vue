<script setup lang="ts">
  import { teamAreas, teamMembers, teamOrgUrl } from '~/data/team'

  const activeMember = ref<(typeof teamMembers)[number] | null>(null)

  function openMember(member: (typeof teamMembers)[number]): void {
    activeMember.value = member
  }

  function closeMember(): void {
    activeMember.value = null
  }

  function onModalKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') closeMember()
  }
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

      <div class="team__people">
        <h3 class="team__people-title">
          {{ $t('team.people.title') }}
        </h3>
        <ul class="team__people-list">
          <li v-for="member in teamMembers" :key="member.login" class="team__person">
            <div class="team__person-card">
              <img
                :src="member.avatar"
                :alt="$t('team.people.avatarAlt', { name: member.name })"
                class="team__avatar"
                width="72"
                height="72"
                loading="lazy"
              />
              <span class="team__person-info">
                <span class="team__person-name">{{ member.name }}</span>
                <span class="team__person-role">{{ $t(`team.members.${member.login}.role`) }}</span>
              </span>
            </div>
            <button
              type="button"
              class="team__person-more"
              :aria-label="$t('team.people.more')"
              @click="openMember(member)"
            >
              {{ $t('team.people.more') }}
              <i class="ti ti-arrow-right" aria-hidden="true" />
            </button>
          </li>
        </ul>
      </div>

      <div
        v-if="activeMember"
        class="team-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="activeMember.name"
        @keydown="onModalKeydown"
      >
        <div class="team-modal__overlay" @click="closeMember" />
        <div class="team-modal__panel">
          <button
            type="button"
            class="team-modal__close"
            :aria-label="$t('team.modal.close')"
            @click="closeMember"
          >
            <i class="ti ti-x" aria-hidden="true" />
          </button>
          <img
            :src="activeMember.avatar"
            :alt="$t('team.people.avatarAlt', { name: activeMember.name })"
            class="team-modal__avatar"
            width="96"
            height="96"
          />
          <h4 class="team-modal__name">
            {{ activeMember.name }}
          </h4>
          <p class="team-modal__role">
            {{ $t(`team.members.${activeMember.login}.role`) }}
          </p>
          <p class="team-modal__bio">
            {{ $t(`team.members.${activeMember.login}.bio`) }}
          </p>
          <div class="team-modal__links">
            <a
              :href="activeMember.profileUrl"
              class="team-modal__profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="ti ti-brand-github" aria-hidden="true" />
              GitHub
            </a>
            <a
              v-for="link in activeMember.links ?? []"
              :key="link.url"
              :href="link.url"
              class="team-modal__profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ link.label }}
            </a>
          </div>
        </div>
      </div>

      <div class="team__work">
        <h3 class="team__work-title">
          {{ $t('team.work.title') }}
        </h3>
        <p class="team__work-text">
          {{ $t('team.work.text') }}
        </p>
      </div>

      <div class="team__contribute">
        <h3 class="team__contribute-title">
          {{ $t('team.contribute.title') }}
        </h3>
        <p class="team__contribute-text">
          {{ $t('team.contribute.text') }}
        </p>
        <ul class="team__contribute-ways">
          <li class="team__contribute-way">
            <i class="ti ti-code" aria-hidden="true" />
            <span>{{ $t('team.contribute.ways.code') }}</span>
          </li>
          <li class="team__contribute-way">
            <i class="ti ti-bug" aria-hidden="true" />
            <span>{{ $t('team.contribute.ways.bugs') }}</span>
          </li>
          <li class="team__contribute-way">
            <i class="ti ti-language" aria-hidden="true" />
            <span>{{ $t('team.contribute.ways.translate') }}</span>
          </li>
          <li class="team__contribute-way">
            <i class="ti ti-share" aria-hidden="true" />
            <span>{{ $t('team.contribute.ways.share') }}</span>
          </li>
        </ul>
        <a
          :href="teamOrgUrl"
          class="team__contribute-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="ti ti-brand-github" aria-hidden="true" />
          {{ $t('team.contribute.button') }}
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

    &__people {
      margin-bottom: 3.5rem;
    }

    &__people-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--piano-text-primary);
      margin-bottom: 1.5rem;
    }

    &__people-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.5rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    &__person {
      display: flex;
      flex-direction: column;
    }

    &__person-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1rem;
      background: var(--piano-bg-secondary);
      border: 1px solid var(--piano-border-subtle);
      border-radius: var(--piano-radius-lg);
      box-shadow: var(--piano-shadow-sm);
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;
      cursor: default;
    }

    &__avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    &__person-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }

    &__person-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--piano-text-primary);
    }

    &__person-role {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--piano-accent);
      line-height: 1.4;
    }

    &__person-more {
      margin-top: 0.5rem;
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--piano-accent);
      background: none;
      border: none;
      padding: 0.25rem 0;
      cursor: pointer;
      transition: gap 0.2s ease;

      &:hover {
        gap: 0.55rem;
      }
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
      margin-bottom: 0;
    }

    &__contribute {
      max-width: 640px;
      margin: 2.5rem auto 0;
      padding: clamp(1.5rem, 4vw, 2.5rem);
      background: var(--piano-bg-solid);
      border: 1px solid var(--piano-border-subtle);
      border-radius: var(--piano-radius-lg);
      text-align: center;
    }

    &__contribute-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--piano-text-primary);
      margin-bottom: 0.5rem;
    }

    &__contribute-text {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--piano-text-secondary);
      max-width: 36rem;
      margin: 0 auto 1.5rem;
    }

    &__contribute-ways {
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      text-align: left;
    }

    &__contribute-way {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--piano-text-secondary);
      padding: 0.5rem 0.75rem;
      border-radius: var(--piano-radius-sm);
      background: var(--piano-gray-100);

      i {
        color: var(--piano-accent);
        font-size: 1.125rem;
        flex-shrink: 0;
      }
    }

    &__contribute-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.75rem;
      border-radius: var(--piano-radius-md);
      font-weight: 600;
      font-size: 0.9375rem;
      text-decoration: none;
      background: var(--piano-accent);
      color: var(--piano-text-on-dark);
      transition:
        background 0.15s ease,
        transform 0.15s ease;

      &:hover {
        background: var(--piano-accent-hover);
        transform: translateY(-2px);
      }
    }
  }

  .team-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;

    &__overlay {
      position: absolute;
      inset: 0;
      background: rgb(0 0 0 / 55%);
    }

    &__panel {
      position: relative;
      max-width: 480px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      background: var(--piano-white);
      border-radius: var(--piano-radius-lg);
      box-shadow: var(--piano-shadow-lg);
      padding: 2.5rem 2rem 2rem;
      text-align: center;
    }

    &__close {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      font-size: 1.1rem;
      color: var(--piano-text-secondary);
      background: none;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: var(--piano-gray-100);
      }
    }

    &__avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      margin-bottom: 1rem;
    }

    &__name {
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--piano-text-primary);
      margin-bottom: 0.25rem;
    }

    &__role {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--piano-accent);
      margin-bottom: 1rem;
    }

    &__bio {
      font-size: 0.95rem;
      color: var(--piano-text-secondary);
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }

    &__links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
    }

    &__profile {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--piano-accent);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border: 1px solid var(--piano-border-subtle);
      border-radius: 999px;
      transition: background 0.2s ease;

      &:hover {
        background: var(--piano-gray-100);
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
