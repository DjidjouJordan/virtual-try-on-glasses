<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  icon: string
  color?: 'blue' | 'emerald' | 'violet' | 'orange'
}>()

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  orange: 'bg-orange-50 text-orange-600'
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      :class="colorMap[color ?? 'blue']"
    >
      <UIcon :name="icon" class="w-6 h-6" />
    </div>
    <div>
      <p class="text-2xl font-extrabold text-slate-900">{{ value }}</p>
      <p class="text-sm text-slate-500 font-medium">{{ label }}</p>
    </div>
  </div>
</template>
