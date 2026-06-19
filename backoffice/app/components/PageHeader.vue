<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="mb-6">
    <h1 class="text-2xl font-extrabold text-slate-900">{{ title }}</h1>
    <p v-if="description" class="text-sm text-slate-500 mt-1">{{ description }}</p>
  </div>
</template>
