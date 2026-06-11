<script setup lang="ts">
import { mockGlasses, useShop } from '~/composables/useShop'

definePageMeta({ layout: false })

const { initTracker, detectFace, isLoaded } = useFaceTracker()
const { initScene, renderFrame, updatePose, updateSize } = useGlassesScene()
const { addToCart, formatPrice } = useShop()

const video = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const isStarted = ref(false)
const isTracking = ref(false)
const isTooFar = ref(false)
const error = ref<string | null>(null)

const selectedIndex = ref(0)
const selectedGlasses = computed(() => mockGlasses[selectedIndex.value])

// Simulated AR measurements
const pdValue = ref('62mm')
const fitLabel = computed(() => {
  const score = selectedGlasses.value.fitScore
  if (score >= 95) return 'Parfait'
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Bon'
  return 'Moyen'
})
const fitColor = computed(() => {
  const score = selectedGlasses.value.fitScore
  if (score >= 95) return 'text-green-400'
  if (score >= 85) return 'text-blue-400'
  return 'text-yellow-400'
})
const scaleValue = computed(() => Math.round(80 + selectedGlasses.value.fitScore * 0.2) + '%')

const snapshot = ref(false)

// ─── Démarrage : caméra → scène → IA → boucle ──────────────────────────────
const startAR = async () => {
  error.value = null
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: 'user' }
    })

    if (!video.value || !canvas.value) return
    video.value.srcObject = stream

    await new Promise<void>((resolve) => {
      if (video.value!.readyState >= 2) resolve()
      else video.value!.addEventListener('loadeddata', () => resolve(), { once: true })
    })

    initScene(canvas.value, video.value)
    await initTracker()

    isStarted.value = true
    window.addEventListener('resize', updateSize)
    requestAnimationFrame(arLoop)
  } catch (err: any) {
    error.value = err?.message?.includes('Permission')
      ? 'Accès caméra refusé. Autorisez la caméra dans votre navigateur.'
      : 'Impossible de démarrer la caméra : ' + (err?.message ?? err)
  }
}

// ─── Boucle AR ──────────────────────────────────────────────────────────────
const arLoop = () => {
  if (video.value && isLoaded.value) {
    const result = detectFace(video.value)
    if (result) {
      isTooFar.value = result.isTooFar
      if (result.facialTransformationMatrixes?.[0]) {
        isTracking.value = true
        updatePose(Array.from(result.facialTransformationMatrixes[0].data))
      } else {
        isTracking.value = false
      }
    }
  }
  renderFrame()
  requestAnimationFrame(arLoop)
}

function takeSnapshot() {
  snapshot.value = true
  setTimeout(() => { snapshot.value = false }, 300)
}

function handleAddToCart() {
  addToCart(selectedGlasses.value)
}

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
  if (video.value?.srcObject) {
    (video.value.srcObject as MediaStream).getTracks().forEach(t => t.stop())
  }
})
</script>

<template>
  <div class="relative w-screen h-screen bg-black overflow-hidden">

    <!-- 1. Flux vidéo miroir (fond) -->
    <video
      ref="video"
      autoplay
      playsinline
      muted
      class="absolute inset-0 w-full h-full object-cover"
      style="transform: scaleX(-1);"
    />

    <!-- 2. Canvas Three.js miroir (overlay transparent) -->
    <canvas
      ref="canvas"
      class="absolute inset-0 w-full h-full"
      style="transform: scaleX(-1);"
    />

    <!-- Snapshot flash -->
    <Transition name="flash">
      <div v-if="snapshot" class="absolute inset-0 bg-white z-50 pointer-events-none" />
    </Transition>

    <!-- 3. AR Overlay (une fois démarré) -->
    <template v-if="isStarted">

      <!-- Header bar -->
      <div class="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-safe-top pt-4">
        <NuxtLink
          to="/catalog"
          class="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 text-white" />
        </NuxtLink>

        <span class="text-white font-extrabold text-base">DPGlasses</span>

        <div class="flex items-center gap-2">
          <button class="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-white" />
          </button>
          <NuxtLink to="/cart" class="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <UIcon name="i-lucide-shopping-bag" class="w-4 h-4 text-white" />
          </NuxtLink>
        </div>
      </div>

      <!-- PD / FIT / SCALE indicators -->
      <div class="absolute top-16 inset-x-0 z-20 flex justify-center">
        <div class="flex items-center gap-4 bg-black/40 backdrop-blur-md rounded-full px-5 py-2">
          <div class="text-center">
            <p class="text-[9px] font-bold text-white/60 tracking-wider">PD</p>
            <p class="text-xs font-extrabold text-white">{{ pdValue }}</p>
          </div>
          <div class="w-px h-6 bg-white/20" />
          <div class="text-center">
            <p class="text-[9px] font-bold text-white/60 tracking-wider">FIT</p>
            <p class="text-xs font-extrabold" :class="fitColor">{{ fitLabel }}</p>
          </div>
          <div class="w-px h-6 bg-white/20" />
          <div class="text-center">
            <p class="text-[9px] font-bold text-white/60 tracking-wider">SCALE</p>
            <p class="text-xs font-extrabold text-white">{{ scaleValue }}</p>
          </div>
        </div>
      </div>

      <!-- Face feedback overlay -->
      <ARFaceFeedbackOverlay
        :is-tracking="isTracking"
        :is-loaded="isLoaded"
        :is-too-far="isTooFar"
      />

      <!-- Side action buttons -->
      <div class="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        <button class="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
          <UIcon name="i-lucide-heart" class="w-4 h-4 text-white" />
        </button>
        <button
          class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/40"
          @click="takeSnapshot"
        >
          <UIcon name="i-lucide-camera" class="w-4 h-4 text-white" />
        </button>
        <button class="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
          <UIcon name="i-lucide-share-2" class="w-4 h-4 text-white" />
        </button>
      </div>

      <!-- Bottom panel -->
      <div class="absolute bottom-0 inset-x-0 z-20">
        <!-- Glasses carousel -->
        <div class="flex gap-3 px-4 pb-2 overflow-x-auto scrollbar-hide">
          <button
            v-for="(item, i) in mockGlasses"
            :key="item.id"
            class="shrink-0 rounded-xl overflow-hidden border-2 transition-all flex flex-col items-center gap-1"
            :class="selectedIndex === i ? 'border-blue-500 shadow-lg shadow-blue-500/40' : 'border-white/20'"
            @click="selectedIndex = i"
          >
            <div
              class="w-16 h-14 flex items-center justify-center"
              :style="`background: linear-gradient(135deg, ${item.bgFrom}, ${item.bgTo})`"
            >
              <UIcon name="i-heroicons-eye" class="w-8 h-8 opacity-30 text-gray-600" />
            </div>
            <p class="text-[8px] font-bold text-white px-1 pb-1 truncate w-16 text-center bg-black/60">
              {{ item.name.split(' ')[0] }}
            </p>
          </button>
        </div>

        <!-- Add to Cart button -->
        <div class="px-4 pb-6 pt-2 bg-gradient-to-t from-black/80 to-transparent">
          <button
            class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/30"
            @click="handleAddToCart"
          >
            <UIcon name="i-lucide-shopping-cart" class="w-5 h-5" />
            Ajouter {{ selectedGlasses.name }} au panier
          </button>
        </div>
      </div>

      <!-- Loading indicator -->
      <div
        v-if="!isLoaded"
        class="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm"
      >
        <UIcon name="i-lucide-loader" class="w-4 h-4 animate-spin" />
        Chargement du moteur IA...
      </div>

    </template>

    <!-- 4. Écran de démarrage -->
    <Transition name="fade">
      <div
        v-if="!isStarted"
        class="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/85 z-30 px-6"
      >
        <div class="text-center space-y-2">
          <div class="flex items-center justify-center gap-2 mb-1">
            <UIcon name="i-lucide-eye" class="w-7 h-7 text-blue-400" />
            <p class="text-3xl font-extrabold text-white tracking-tight">DPGlasses</p>
          </div>
          <p class="text-white/50 text-sm">Essayage virtuel en réalité augmentée</p>
        </div>

        <div v-if="error" class="w-full p-4 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-300 text-sm text-center">
          {{ error }}
        </div>

        <button
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-8 py-4 rounded-full shadow-2xl shadow-blue-600/40 transition-all text-base"
          @click="startAR"
        >
          <UIcon name="i-lucide-camera" class="w-5 h-5" />
          Démarrer l'essayage
        </button>

        <p class="text-white/30 text-xs text-center max-w-xs leading-relaxed">
          L'analyse faciale s'effectue entièrement sur votre appareil — aucune donnée biométrique n'est transmise.
        </p>

        <NuxtLink to="/catalog" class="text-white/40 text-sm flex items-center gap-1">
          <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5" />
          Retour au catalogue
        </NuxtLink>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.flash-enter-active, .flash-leave-active { transition: opacity 0.15s ease; }
.flash-enter-from, .flash-leave-to { opacity: 0; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
