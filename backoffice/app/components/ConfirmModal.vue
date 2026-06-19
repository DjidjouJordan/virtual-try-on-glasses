<script setup lang="ts">
defineProps<{
  open: boolean
  title?: string
  message?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <UModal :open="open" @update:open="emit('cancel')">
    <template #content>
      <div class="p-6 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-triangle-alert" class="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p class="font-bold text-slate-900">{{ title ?? 'Confirmer la suppression' }}</p>
            <p class="text-sm text-slate-500">{{ message ?? 'Cette action est irréversible.' }}</p>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button
            class="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            @click="emit('cancel')"
          >
            Annuler
          </button>
          <button
            :disabled="loading"
            class="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors flex items-center gap-2"
            @click="emit('confirm')"
          >
            <UIcon v-if="loading" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
            Supprimer
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>
