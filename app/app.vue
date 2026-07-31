<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
  // Global SEO defaults — pages can override via useAppHead({ title, description })
  useAppHead()
</script>
