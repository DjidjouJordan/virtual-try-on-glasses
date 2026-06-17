<template>
  <ClientOnly>
    <main class="relative w-full h-screen bg-black overflow-hidden">

      <!-- Flux caméra -->
      <video
        ref="videoSource"
        class="absolute inset-0 w-full h-full object-cover"
        autoplay
        muted
        playsinline
        style="transform: scaleX(-1);"
      />

      <!-- Canvas Three.js -->
      <canvas
        ref="arCanvas"
        class="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
        style="transform: scaleX(-1);"
      />

      <!-- Flash snapshot -->
      <Transition name="flash">
        <div
          v-if="snapshotFlash"
          class="absolute inset-0 bg-white z-50 pointer-events-none"
        />
      </Transition>

      <template v-if="isStarted">
        <!-- Header -->
        <div class="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-4">
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
            <NuxtLink
              to="/cart"
              class="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
            >
              <UIcon name="i-lucide-shopping-bag" class="w-4 h-4 text-white" />
            </NuxtLink>
          </div>
        </div>

        <!-- Panneau PD / FIT / SCORE décalé à gauche -->
        <div class="absolute top-16 left-4 z-20 flex flex-col items-start gap-2 w-[190px]">
          <div class="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-3 w-full border border-white/10">
            <div class="grid grid-cols-1 gap-2">
              <div class="flex items-center justify-between gap-3">
                <p class="text-[9px] font-bold text-white/60 tracking-wider">PD</p>
                <p class="text-xs font-extrabold text-white">{{ pdValue }}</p>
              </div>

              <div class="flex items-center justify-between gap-3">
                <p class="text-[9px] font-bold text-white/60 tracking-wider">FIT</p>
                <p class="text-xs font-extrabold" :class="fitColorStr">{{ fitLabelStr }}</p>
              </div>

              <div class="flex items-center justify-between gap-3">
                <p class="text-[9px] font-bold text-white/60 tracking-wider">SCORE</p>
                <p class="text-xs font-extrabold text-white">{{ scaleValue }}</p>
              </div>
            </div>
          </div>

          <button
            v-if="isTracking"
            class="flex items-center gap-1.5 bg-blue-600/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-blue-600 transition-colors"
            @click="measurePDNow"
          >
            <UIcon name="i-lucide-ruler" class="w-3 h-3" />
            Mesurer mon PD
          </button>
        </div>

        <!-- Dialog sauvegarde PD -->
        <Transition name="fade">
          <div
            v-if="showPDSave"
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-black/80 backdrop-blur-md rounded-3xl p-6 w-72 text-center space-y-4"
          >
            <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto">
              <UIcon name="i-lucide-ruler" class="w-6 h-6 text-white" />
            </div>

            <div>
              <p class="text-white font-extrabold text-lg">{{ measuredPD }} mm</p>
              <p class="text-white/60 text-xs mt-1">Écart pupillaire mesuré</p>
            </div>

            <div class="flex gap-3">
              <button
                class="flex-1 py-2.5 rounded-2xl border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-colors"
                @click="showPDSave = false"
              >
                Ignorer
              </button>
              <button
                :disabled="savingPD"
                class="flex-1 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-1.5 transition-colors"
                @click="savePD"
              >
                <UIcon v-if="savingPD" name="i-lucide-loader-circle" class="w-3.5 h-3.5 animate-spin" />
                {{ savingPD ? '…' : 'Sauvegarder' }}
              </button>
            </div>
          </div>
        </Transition>

        <!-- Feedback face -->
        <ARFaceFeedbackOverlay
          :is-tracking="isTracking"
          :is-loaded="isLoaded"
          :is-too-far="isTooFar"
        />

        <!-- Boutons latéraux -->
        <div class="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          <button
            class="w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm transition-colors"
            :class="isFavori ? 'bg-red-500 shadow-lg shadow-red-500/40' : 'bg-black/40'"
            @click="toggleFavori"
          >
            <UIcon
              :name="isFavori ? 'i-lucide-heart' : 'i-lucide-heart'"
              class="w-4 h-4 text-white"
            />
          </button>

          <button
            class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/40 disabled:opacity-60"
            :disabled="savingSnapshot"
            @click="takeSnapshot"
          >
            <UIcon
              :name="savingSnapshot ? 'i-lucide-loader-circle' : 'i-lucide-camera'"
              class="w-4 h-4 text-white"
              :class="{ 'animate-spin': savingSnapshot }"
            />
          </button>

          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <UIcon name="i-lucide-share-2" class="w-4 h-4 text-white" />
          </button>
        </div>

        <!-- Bandeau montures -->
        <div class="absolute bottom-0 inset-x-0 z-20">
          <div class="flex gap-3 px-4 pb-2 overflow-x-auto scrollbar-hide">
            <button
              v-for="(item, i) in montureStore.montures"
              :key="item.id"
              class="shrink-0 rounded-xl overflow-hidden border-2 transition-all flex flex-col items-center gap-1"
              :class="selectedIndex === i ? 'border-blue-500 shadow-lg shadow-blue-500/40' : 'border-white/20'"
              @click="selectedIndex = i"
            >
              <div class="w-16 h-14 flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 to-blue-200">
                <img
                  v-if="getMontureImage(item)"
                  :src="getMontureImage(item)"
                  :alt="getMontureLabel(item)"
                  class="w-full h-full object-cover"
                >
                <UIcon v-else name="i-lucide-glasses" class="w-8 h-8 opacity-30 text-blue-600" />
              </div>

              <p class="text-[8px] font-bold text-white px-1 pb-1 truncate w-16 text-center bg-black/60">
                {{ getMontureLabel(item).split(' ')[0] }}
              </p>
            </button>
          </div>

          <div class="px-4 pb-6 pt-2 bg-gradient-to-t from-black/80 to-transparent">
            <button
              v-if="selectedMonture"
              class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/30"
              @click="handleAddToCart"
            >
              <UIcon name="i-lucide-shopping-cart" class="w-5 h-5" />
              Ajouter {{ getMontureLabel(selectedMonture) }} au panier
            </button>
          </div>
        </div>

        <!-- Loading IA -->
        <div
          v-if="!isLoaded"
          class="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm"
        >
          <UIcon name="i-lucide-loader" class="w-4 h-4 animate-spin" />
          Chargement du moteur IA...
        </div>
      </template>

      <!-- Écran de démarrage -->
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

          <div
            v-if="error"
            class="w-full p-4 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-300 text-sm text-center"
          >
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

    </main>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/authStore'
import { useCartStore } from '~/stores/cartStore'
import { useFavoriStore } from '~/stores/favoriStore'
import { useMontureStore } from '~/stores/montureStore'
import { useSnapshotStore } from '~/stores/snapshotStore'
import { measurePDFromLandmarks, calculerFit, fitLabel as toFitLabel, fitColor as toFitColor } from '~/composables/usePDMeasure'
import { useFaceTracker } from '~/composables/useFaceTracker'
import { useGlassesScene } from '~/composables/useGlassesScene'

definePageMeta({ layout: false })

const route = useRoute()

const auth = useAuthStore()
const cartStore = useCartStore()
const favoriStore = useFavoriStore()
const montureStore = useMontureStore()
const snapshotStore = useSnapshotStore()

const videoSource = ref<HTMLVideoElement | null>(null)
const arCanvas = ref<HTMLCanvasElement | null>(null)

const isStarted = ref(false)
const isTracking = ref(false)
const isTooFar = ref(false)
const error = ref<string | null>(null)
const savingSnapshot = ref(false)
const snapshotFlash = ref(false)

const selectedIndex = ref(0)

const lastLandmarks = ref<any[]>([])
const measuredPD = ref<number | null>(null)
const showPDSave = ref(false)
const savingPD = ref(false)

const { initTracker, detectFace, isLoaded } = useFaceTracker()
const { initScene, renderFrame, updatePose, updateSize, loadGlasses } = useGlassesScene()

const selectedMonture = computed(() => montureStore.montures[selectedIndex.value] ?? null)

const isFavori = computed(() =>
  selectedMonture.value ? favoriStore.isFavori(selectedMonture.value.id) : false
)

const userPD = computed(() => auth.user?.client?.ecart_pupillaire ?? null)

const pdValue = computed(() => {
  if (measuredPD.value !== null) return `${measuredPD.value}mm*`
  return userPD.value !== null ? `${userPD.value}mm` : '?mm'
})

const fitScore = computed(() => calculerFit(userPD.value))
const fitLabelStr = computed(() => (userPD.value !== null ? toFitLabel(fitScore.value) : '—'))
const fitColorStr = computed(() => toFitColor(fitScore.value))
const scaleValue = computed(() => (userPD.value !== null ? `${fitScore.value}%` : '—'))

function getMontureLabel(item: any): string {
  return item?.nom || item?.modele || 'Monture'
}

function getMontureImage(item: any): string | null {
  return item?.image?.original || item?.image_url || null
}

function getMontureModelUrl(item: any): string | null {
  return item?.modele3d?.url_fichier
    || item?.modele3d?.url
    || item?.modele3_d?.url_fichier
    || item?.modele3_d?.url
    || null
}

function getMontureScaleOffset(item: any): number {
  const raw = item?.modele3d?.scale_offset ?? item?.modele3_d?.scale_offset ?? 1
  const n = Number.parseFloat(String(raw))
  return Number.isFinite(n) ? n : 1
}

function loadSelectedGlasses() {
  const m = selectedMonture.value
  if (!m) return

  const url = getMontureModelUrl(m)
  if (!url) {
    console.warn('Aucun modèle 3D disponible pour cette monture.', m)
    return
  }

  loadGlasses(url, getMontureScaleOffset(m))
}

async function startAR() {
  error.value = null

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: 'user' }
    })

    if (!videoSource.value || !arCanvas.value) return

    videoSource.value.srcObject = stream

    await new Promise<void>((resolve) => {
      if (!videoSource.value) return resolve()
      if (videoSource.value.readyState >= 2) resolve()
      else videoSource.value.addEventListener('loadeddata', () => resolve(), { once: true })
    })

    initScene(arCanvas.value, videoSource.value)
    await initTracker()

    isStarted.value = true

    loadSelectedGlasses()

    window.addEventListener('resize', updateSize)
    requestAnimationFrame(arLoop)
  } catch (err: any) {
    error.value = err?.message?.includes('Permission')
      ? 'Accès caméra refusé. Autorisez la caméra dans votre navigateur.'
      : 'Impossible de démarrer la caméra : ' + (err?.message ?? String(err))
  }
}

function arLoop() {
  if (videoSource.value && isLoaded.value) {
    const result = detectFace(videoSource.value)

    if (result) {
      isTooFar.value = !!result.isTooFar

      if (result.faceLandmarks?.[0]) {
        lastLandmarks.value = result.faceLandmarks[0]
      }

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

watch(selectedIndex, () => {
  if (isStarted.value) loadSelectedGlasses()
})

watch(
  () => montureStore.montures,
  () => {
    const idFromQuery = route.query.id as string | undefined
    if (idFromQuery) {
      const idx = montureStore.montures.findIndex(m => m.id === idFromQuery)
      if (idx >= 0) selectedIndex.value = idx
    }
  },
  { deep: true }
)

function measurePDNow() {
  if (!lastLandmarks.value.length || !videoSource.value) return

  const pd = measurePDFromLandmarks(
    lastLandmarks.value,
    videoSource.value.videoWidth,
    videoSource.value.videoHeight
  )

  if (pd !== null) {
    measuredPD.value = pd
    showPDSave.value = true
  }
}

async function savePD() {
  if (measuredPD.value === null) return
  if (!auth.isAuthenticated) {
    await navigateTo('/login')
    return
  }

  savingPD.value = true
  try {
    await useFetch('http://localhost:8000/api/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: { ecart_pupillaire: measuredPD.value }
    })

    await auth.fetchMe()
    showPDSave.value = false
  } finally {
    savingPD.value = false
  }
}

async function takeSnapshot() {
  if (!arCanvas.value) return

  snapshotFlash.value = true
  setTimeout(() => {
    snapshotFlash.value = false
  }, 300)

  if (auth.isAuthenticated) {
    savingSnapshot.value = true
    try {
      await snapshotStore.generate(arCanvas.value)
    } finally {
      savingSnapshot.value = false
    }
  }
}

async function toggleFavori() {
  if (!auth.isAuthenticated) {
    await navigateTo('/login')
    return
  }

  if (selectedMonture.value) {
    await favoriStore.toggle(selectedMonture.value.id)
  }
}

function handleAddToCart() {
  if (selectedMonture.value) {
    cartStore.add(selectedMonture.value)
  }
}

onMounted(async () => {
  auth.restore()
  await montureStore.fetchAll()

  const idFromQuery = route.query.id as string | undefined
  if (idFromQuery) {
    const idx = montureStore.montures.findIndex(m => m.id === idFromQuery)
    if (idx >= 0) selectedIndex.value = idx
  }

  if (auth.isAuthenticated) {
    await favoriStore.fetchAll()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)

  if (videoSource.value?.srcObject) {
    (videoSource.value.srcObject as MediaStream).getTracks().forEach(t => t.stop())
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.flash-enter-active,
.flash-leave-active {
  transition: opacity 0.15s ease;
}

.flash-enter-from,
.flash-leave-to {
  opacity: 0;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>