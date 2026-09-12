<script setup lang="ts">
  /**
   * Card da ISO VoidBR LouvorJA Piano — distro Linux com o PIANO
   * pré-instalado, mantida pela comunidade VoidBR (Vilmar Catafesta).
   *
   * A versão/tamanho vêm do endpoint server-side (proxy com token, sem
   * rate limit) que lê o diretório /iso/current/ do voidbr.org.
   */
  interface VoidBrIso {
    available: boolean
    fileName: string | null
    url: string | null
    sizeBytes: number | null
    builtAt: string | null
  }

  const props = defineProps<{ iso: VoidBrIso | null }>()

  const sizeLabel = computed(() => {
    const bytes = props.iso?.sizeBytes
    if (!bytes) return null
    const gb = bytes / 1024 ** 3
    return `${gb.toFixed(1)} GB`
  })
</script>

<template>
  <section class="voidbr-iso">
    <div class="voidbr-iso__container">
      <span class="voidbr-iso__eyebrow">{{ $t('download.voidbr.eyebrow') }}</span>
      <h2 class="voidbr-iso__title">
        {{ $t('download.voidbr.title') }}
      </h2>
      <p class="voidbr-iso__subtitle">
        {{ $t('download.voidbr.subtitle') }}
      </p>

      <div class="voidbr-iso__card">
        <div class="voidbr-iso__icon">
          <i class="ti ti-disc" aria-hidden="true" />
        </div>
        <div class="voidbr-iso__info">
          <h3 class="voidbr-iso__name">VoidBR LouvorJA Piano</h3>
          <p class="voidbr-iso__desc">
            {{ $t('download.voidbr.description') }}
          </p>
          <ul class="voidbr-iso__features">
            <li>
              <i class="ti ti-check" aria-hidden="true" />
              {{ $t('download.voidbr.feature1') }}
            </li>
            <li>
              <i class="ti ti-check" aria-hidden="true" />
              {{ $t('download.voidbr.feature2') }}
            </li>
            <li>
              <i class="ti ti-check" aria-hidden="true" />
              {{ $t('download.voidbr.feature3') }}
            </li>
          </ul>
          <p v-if="iso?.available" class="voidbr-iso__meta">
            <span v-if="sizeLabel">{{ sizeLabel }}</span>
            <span v-if="iso.builtAt">{{ iso.builtAt }}</span>
          </p>
        </div>
        <div class="voidbr-iso__action">
          <a
            v-if="iso?.available && iso.url"
            :href="iso.url"
            class="voidbr-iso__btn"
            :aria-label="$t('download.voidbr.downloadLabel')"
            rel="noopener"
          >
            <i class="ti ti-download" aria-hidden="true" />
            {{ $t('download.voidbr.downloadLabel') }}
          </a>
          <span v-else class="voidbr-iso__btn voidbr-iso__btn--disabled">
            {{ $t('download.voidbr.unavailable') }}
          </span>
          <a href="https://voidbr.org" class="voidbr-iso__link" rel="noopener">
            {{ $t('download.voidbr.communityLink') }}
            <i class="ti ti-external-link" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .voidbr-iso {
    padding: 4rem 1.5rem;
    background: var(--piano-dark, #0a1733);

    &__container {
      max-width: 1100px;
      margin: 0 auto;
      text-align: center;
    }

    &__eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--piano-yellow, #fcce02);
      margin-bottom: 0.75rem;
    }

    &__title {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 800;
      color: #fff;
      margin: 0 0 0.75rem;
    }

    &__subtitle {
      color: var(--piano-gray-300, #cbd5e1);
      max-width: 640px;
      margin: 0 auto 2rem;
    }

    &__card {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 2rem;
      align-items: center;
      text-align: left;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 2rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }

    &__icon {
      font-size: 3.5rem;
      color: var(--piano-cyan, #00c1e6);

      @media (max-width: 768px) {
        display: flex;
        justify-content: center;
      }
    }

    &__name {
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
      margin: 0 0 0.5rem;
    }

    &__desc {
      color: var(--piano-gray-300, #cbd5e1);
      margin: 0 0 1rem;
    }

    &__features {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 0.4rem;

      li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--piano-gray-100, #f1f5f9);
        font-size: 0.9rem;

        @media (max-width: 768px) {
          justify-content: center;
        }

        i {
          color: var(--piano-yellow, #fcce02);
        }
      }
    }

    &__meta {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      color: var(--piano-gray-500, #64748b);
      font-size: 0.85rem;

      @media (max-width: 768px) {
        justify-content: center;
      }
    }

    &__action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;

      @media (max-width: 768px) {
        align-items: stretch;
      }
    }

    &__btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--piano-yellow, #fcce02);
      color: var(--piano-dark, #0a1733);
      font-weight: 700;
      padding: 0.85rem 1.75rem;
      border-radius: 8px;
      text-decoration: none;
      white-space: nowrap;
      transition: filter 0.2s;

      &:hover {
        filter: brightness(1.08);
      }

      &--disabled {
        background: rgba(255, 255, 255, 0.08);
        color: var(--piano-gray-500, #64748b);
        cursor: not-allowed;
      }
    }

    &__link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--piano-cyan, #00c1e6);
      font-size: 0.875rem;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
