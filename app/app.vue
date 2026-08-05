<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <CookieBanner />
</template>

<script setup lang="ts">
  // Global SEO defaults — pages can override via useAppHead({ title, description })
  useAppHead()
</script>
