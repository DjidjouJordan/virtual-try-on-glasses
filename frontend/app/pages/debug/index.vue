<template>
  <ClientOnly>
    <main class="relative w-full h-screen bg-black overflow-hidden">
      <video ref="videoSource" class="absolute inset-0 w-full h-full object-cover" autoplay muted playsinline />

      <canvas ref="arCanvas" class="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none" />

      <FaceFeedbackOverlay v-if="isLoaded" :is-tracking="isTracking" />

      <div v-if="!isLoaded" class="absolute inset-0 bg-black z-50 flex items-center justify-center">
        <p class="text-white text-xs tracking-widest uppercase">
          Initialisation du flux...
        </p>
      </div>
    </main>
  </ClientOnly>
</template>

<script setup lang="ts">
import FaceFeedbackOverlay from '~/components/AR/FaceFeedbackOverlay.vue'
import { useFaceTracker } from '~/composables/useFaceTracker'
import { useGlassesScene } from '~/composables/useGlassesScene'

const videoSource = ref<HTMLVideoElement | null>(null)
const arCanvas = ref<HTMLCanvasElement | null>(null)
const isTracking = ref(false)

const { initTracker, detectFace, isLoaded } = useFaceTracker()
const { initScene, renderFrame, updatePose, updateSize } = useGlassesScene()

/**
 * Fonction de gestion du redimensionnement
 */
const onResize = () => {
  updateSize()
}

const loop = () => {
  if (videoSource.value && isLoaded.value) {
    const results = detectFace(videoSource.value)

    if (results && results.facialTransformationMatrixes?.[0]) {
      updatePose(results.facialTransformationMatrixes[0].data)
      isTracking.value = true
    } else {
      isTracking.value = false
    }
    renderFrame()
  }
  requestAnimationFrame(loop)
}

onMounted(async () => {
  // 1. Écouter le changement de taille de fenêtre
  window.addEventListener('resize', onResize)

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
    })

    if (videoSource.value && arCanvas.value) {
      videoSource.value.srcObject = stream
      videoSource.value.onloadedmetadata = async () => {
        await initTracker()
        initScene(arCanvas.value!, videoSource.value!)
        loop()
      }
    }
  } catch (err) {
    console.error('Erreur accès caméra :', err)
  }
})

/**
 * TRÈS IMPORTANT : Nettoyage de l'événement
 */
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>
