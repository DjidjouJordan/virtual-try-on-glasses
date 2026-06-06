<template>
  <div class="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
    <div class="w-64 h-80 border-2 transition-all duration-500 ease-in-out" :class="[
      // Vert si tout est OK, Jaune si trop loin, Blanc pointillé si aucun visage
      isTracking && !isTooFar
        ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.4)] rounded-[100%]'
        : isTooFar
          ? 'border-yellow-400 scale-110 border-solid rounded-[100%]'
          : 'border-white/40 border-dashed rounded-[100%]'
    ]" />

    <div class="mt-10 px-6 py-3 rounded-full backdrop-blur-lg text-white font-semibold transition-all shadow-lg" :class="[
      !isTracking ? 'bg-red-500/80' : isTooFar ? 'bg-yellow-600/80' : 'bg-green-600/60'
    ]">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full shadow-sm" :class="[
          isTracking && !isTooFar ? 'bg-green-300' : 'bg-white animate-pulse'
        ]" />

        <span class="tracking-wide uppercase text-xs">
          {{ statusMessage }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * PROPS : Reçoit les états calculés par la page parente.
 */
interface Props {
  isTracking: boolean // Visage détecté ou non
  isLoaded: boolean // IA prête ou non
  isTooFar: boolean // Distance utilisateur/écran
}

const props = defineProps<Props>()

/**
 * LOGIQUE : Traduction des états techniques en messages compréhensibles.
 */
const statusMessage = computed(() => {
  if (!props.isLoaded) return 'Chargement du module IA...'
  if (!props.isTracking) return 'Veuillez vous placer face caméra'
  if (props.isTooFar) return 'Approchez-vous un peu plus'
  return 'Analyse faciale optimale'
})
</script>

<style scoped>
/* Force la forme ovale parfaite */
.rounded-\[100\%\] {
  border-radius: 100%;
}
</style>
