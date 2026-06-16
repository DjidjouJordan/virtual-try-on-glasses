<template>
  <ClientOnly>
    <main class="relative w-full h-screen bg-black overflow-hidden">
      <video ref="videoSource" class="absolute inset-0 w-full h-full object-cover" autoplay muted playsinline />

      <canvas ref="arCanvas" class="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none" />

      <div class="absolute top-4 left-4 z-50 bg-black/70 px-3 py-1 rounded text-mono text-xs text-green-400 flex items-center gap-2 border border-green-500/30">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span>Suivi IA : {{ fps }} FPS</span>
      </div>

      <div v-if="cameraError" class="absolute inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-6 text-center text-white">
        <span class="text-6xl mb-4">🕶️❌</span>
        <h2 class="text-xl font-bold mb-2 tracking-wide uppercase text-red-500">
          Accès caméra impossible
        </h2>
        <p class="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
          {{ cameraError }}
        </p>
        <UButton
          color="primary"
          variant="solid"
          label="Réessayer l'accès"
          icon="i-heroicons-arrow-path"
          size="lg"
          @click="setupCamera"
        />
      </div>

      <div v-else-if="!isLoaded" class="absolute inset-0 bg-black z-50 flex items-center justify-center">
        <p class="text-white text-xs tracking-widest uppercase animate-pulse">
          Initialisation du flux...
        </p>
      </div>
    </main>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useFaceTracker } from '~/composables/useFaceTracker'
import { useGlassesScene } from '~/composables/useGlassesScene'

const videoSource = ref<HTMLVideoElement | null>(null)
const arCanvas = ref<HTMLCanvasElement | null>(null)
const isTracking = ref(false)
const cameraError = ref<string>('')

// --- VARIABLES DE CONFIGURATION CHRONOMÉTRIQUE ET PROFILAGE ---
const fps = ref(0)
let frameCount = 0
let lastFpsUpdate = 0
let lastInferenceTime = 0
const INFERENCE_INTERVAL_MS = 1000 / 30 // Cible stricte : ~33.33ms pour bloquer à 30 FPS maximum

const { initTracker, detectFace, isLoaded } = useFaceTracker()
const { initScene, renderFrame, updatePose, updateSize } = useGlassesScene()

const onResize = () => {
  updateSize()
}

/**
 * Boucle de traitement optimisée avec limiteur de fréquence
 */
const loop = (timestamp: number) => {
  if (videoSource.value && isLoaded.value) {
    
    // ⚡ OPTIMISATION 2 : Brider l'inférence MediaPipe pour soulager le SoC mobile
    if (timestamp - lastInferenceTime >= INFERENCE_INTERVAL_MS) {
      const results = detectFace(videoSource.value)

      if (results && results.facialTransformationMatrixes?.[0]) {
        updatePose(results.facialTransformationMatrixes[0].data)
        isTracking.value = true
      } else {
        isTracking.value = false
      }
      
      lastInferenceTime = timestamp

      // --- LOGIQUE DE CALCUL DU PROFILAGE FPS ---
      frameCount++
      if (timestamp - lastFpsUpdate >= 1000) {
        fps.value = Math.round((frameCount * 1000) / (timestamp - lastFpsUpdate))
        frameCount = 0
        lastFpsUpdate = timestamp
      }
    }

    // Le moteur graphique Three.js s'exécute séparément pour maintenir la fluidité visuelle
    renderFrame()
  }
  requestAnimationFrame(loop)
}

const setupCamera = async () => {
  cameraError.value = ''
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    cameraError.value = "L'accès à la caméra n'est pas sécurisé ou non supporté (HTTPS requis)."
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    })

    if (videoSource.value && arCanvas.value) {
      videoSource.value.srcObject = stream
      videoSource.value.onloadedmetadata = async () => {
        await initTracker()
        initScene(arCanvas.value!, videoSource.value!)
        // On initialise la boucle d'animation native
        requestAnimationFrame(loop)
      }
    }
  } catch (err: any) {
    cameraError.value = "Erreur d'initialisation de la caméra."
    console.error(err)
  }
}

onMounted(async () => {
  window.addEventListener('resize', onResize)
  await setupCamera()
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>