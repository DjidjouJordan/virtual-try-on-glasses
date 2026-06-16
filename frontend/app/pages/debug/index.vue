<template>
  <ClientOnly>
    <main class="relative w-full h-screen bg-black overflow-hidden">
      <!-- 🎥 Flux caméra -->
      <video
        ref="videoSource"
        class="absolute inset-0 w-full h-full object-cover"
        autoplay
        muted
        playsinline
      />

      <!-- 🎨 Canvas Three.js (overlay AR) -->
      <canvas
        ref="arCanvas"
        class="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
      />

      <!-- 📊 FPS Overlay -->
      <div class="absolute top-4 left-4 z-50 bg-black/70 px-3 py-1 rounded text-xs text-green-400 flex items-center gap-2 border border-green-500/30">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span>Suivi IA : {{ fps }} FPS</span>
      </div>

      <!-- ❌ Erreur caméra -->
      <div
        v-if="cameraError"
        class="absolute inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-6 text-center text-white"
      >
        <span class="text-6xl mb-4">🕶️❌</span>

        <h2 class="text-xl font-bold mb-2 uppercase text-red-500">
          Accès caméra impossible
        </h2>

        <p class="text-sm text-gray-400 max-w-md mb-6">
          {{ cameraError }}
        </p>

        <UButton
          label="Réessayer"
          icon="i-heroicons-arrow-path"
          @click="setupCamera"
        />
      </div>

      <!-- ⏳ Loading -->
      <div
        v-else-if="!isLoaded"
        class="absolute inset-0 bg-black z-50 flex items-center justify-center"
      >
        <p class="text-white text-xs uppercase animate-pulse">
          Initialisation du flux...
        </p>
      </div>
    </main>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useFaceTracker } from '~/composables/useFaceTracker'
import { useGlassesScene } from '~/composables/useGlassesScene'
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'

const route = useRoute()

const videoSource = ref<HTMLVideoElement | null>(null)
const arCanvas = ref<HTMLCanvasElement | null>(null)

const fps = ref(0)

const { initTracker, detectFace, isLoaded } = useFaceTracker()
const { initScene, renderFrame, updatePose, updateSize, loadGlasses } = useGlassesScene()

const loop = () => {
  if (videoSource.value && isLoaded.value) {
    const results = detectFace(videoSource.value)

    if (results?.facialTransformationMatrixes?.[0]) {
      updatePose(results.facialTransformationMatrixes[0].data)
    }

    renderFrame()
  }

  requestAnimationFrame(loop)
}

const setupCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  })

  if (videoSource.value && arCanvas.value) {
    videoSource.value.srcObject = stream

    videoSource.value.onloadedmetadata = async () => {
      await initTracker()
      initScene(arCanvas.value!)

      // 🔥 ICI ON CHARGE LA LUNETTE
      const url = route.query.model as string

      if (url) {
        loadGlasses(url)
      }

      requestAnimationFrame(loop)
    }
  }
}

onMounted(() => {
  window.addEventListener('resize', updateSize)
  setupCamera()
})
</script>