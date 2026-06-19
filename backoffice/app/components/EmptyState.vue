<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
      <UIcon :name="icon ?? 'i-lucide-inbox'" class="w-8 h-8 text-slate-400" />
    </div>
    <p class="font-bold text-slate-700">{{ title ?? 'Aucun résultat' }}</p>
    <p class="text-sm text-slate-400 mt-1">{{ description ?? 'Il n\'y a rien à afficher pour le moment.' }}</p>
  </div>
</template>
