<script setup lang="ts">
  /**
   * Admin layout — minimal, no site nav/footer.
   * Used by /admin/login and /admin/dashboard.
   */
</script>

<template>
  <div class="admin-layout">
    <slot />
  </div>
</template>

<style scoped>
  .admin-layout {
    min-height: 100vh;
    background: #0a0e1a;
    color: #e8eef5;
  }
</style>
