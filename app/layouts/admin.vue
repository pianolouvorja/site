<script setup lang="ts">
  /**
   * Admin layout — navegação entre os painéis do admin.
   * Conteúdo (coletâneas), Comunidade (moderação), Newsletter, Dashboard.
   */
  const route = useRoute()

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: 'ti-layout-dashboard' },
    { to: '/admin/conteudo', label: 'Conteúdo', icon: 'ti-music' },
    { to: '/admin/newsletter', label: 'Newsletter', icon: 'ti-mail' },
  ] as const
</script>

<template>
  <div class="admin-layout">
    <nav v-if="!route.path.startsWith('/admin/login')" class="admin-nav" aria-label="Navegação do admin">
      <NuxtLink to="/admin" class="admin-nav__brand" aria-label="Início do admin">
        <i class="ti ti-piano" aria-hidden="true" />
        <span>PIANO Admin</span>
      </NuxtLink>
      <ul class="admin-nav__items">
        <li v-for="item in navItems" :key="item.to">
          <NuxtLink
            :to="item.to"
            :class="['admin-nav__link', { active: route.path === item.to }]"
            :aria-current="route.path === item.to ? 'page' : undefined"
          >
            <i :class="['ti', item.icon]" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
    <main class="admin-layout__content">
      <slot />
    </main>
  </div>
</template>

<style scoped lang="scss">
  .admin-layout {
    min-height: 100vh;
    background: #0a0e1a;
    color: #e8eef5;
  }

  .admin-nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.75rem 1.5rem;
    background: #0d1322;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

    &__brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #fcce02;
      font-weight: 700;
      text-decoration: none;

      .ti {
        font-size: 1.25rem;
      }
    }

    &__items {
      display: flex;
      gap: 0.25rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    &__link {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.875rem;
      border-radius: 8px;
      color: #8b98ab;
      text-decoration: none;
      font-size: 0.875rem;
      transition: background 0.15s, color 0.15s;

      &:hover {
        color: #e8eef5;
        background: rgba(255, 255, 255, 0.06);
      }

      &.active {
        color: #fcce02;
        background: rgba(252, 206, 2, 0.1);
      }
    }
  }

  .admin-layout__content {
    min-height: calc(100vh - 3.25rem);
  }

  @media (max-width: 600px) {
    .admin-nav {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
    }

    .admin-nav__items {
      flex-wrap: wrap;
    }
  }
</style>
