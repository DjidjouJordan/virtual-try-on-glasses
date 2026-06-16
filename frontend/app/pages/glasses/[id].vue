<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTryOnStore } from '~/stores/tryon.store'

const route = useRoute()
const router = useRouter()

const config = useRuntimeConfig()
const baseURL = config.public.apiBase || 'http://localhost:8000/api'

const monture = ref<any>(null)
const loading = ref(true)
const error = ref<any>(null)

const tryOnStore = useTryOnStore()

async function fetchMontureById(id: string) {
  const res = await $fetch<{ data: any }>(`${baseURL}/montures/${id}`)
  return res.data
}

onMounted(async () => {
  try {
    const id = route.params.id as string
    monture.value = await fetchMontureById(id)
    console.log('MONTURE CHARGÉE:', monture.value)
  } catch (e) {
    console.error('Erreur fetch monture:', e)
    error.value = e
    monture.value = null
  } finally {
    loading.value = false
  }
})

function goTryOn() {
  const modelUrl = monture.value?.modele3d?.url || ''

  router.push({
    path: '/debug',
    query: {
      model: modelUrl
    }
  })
}

function formatPrice(prix: number | string | undefined) {
  if (prix === undefined || prix === null) return '0'
  return parseFloat(String(prix)).toLocaleString('fr-FR') + ' FCFA'
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <p class="text-gray-500 font-medium">Chargement de la monture...</p>
  </div>

  <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen gap-4">
    <p class="text-red-500 font-semibold">Erreur de chargement du modèle.</p>
    <NuxtLink to="/catalog" class="text-blue-600 underline">Retour au catalogue</NuxtLink>
  </div>

  <div v-else-if="monture" class="min-h-screen bg-white">

    <div class="sticky top-0 z-30 bg-white border-b px-4 py-3">
      <div class="flex items-center gap-3">
        <NuxtLink to="/catalog" class="text-xl font-bold text-gray-700 hover:text-blue-600">←</NuxtLink>
        <h1 class="font-bold text-gray-800">{{ monture.nom }}</h1>
      </div>
    </div>

    <div class="p-6 max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

      <div class="aspect-square bg-gray-50 rounded-2xl border flex items-center justify-center overflow-hidden">
        <img
          v-if="monture.image?.original"
          :src="monture.image.original"
          :alt="monture.nom"
          class="w-full h-full object-cover"
        />
      </div>

      <div>
        <h2 class="text-2xl font-black">{{ monture.nom }}</h2>

        <p class="text-blue-700 text-2xl font-extrabold mt-3">
          {{ formatPrice(monture.prix) }}
        </p>

        <p class="mt-4 text-gray-600">
          {{ monture.description }}
        </p>

        <div class="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            class="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl"
            @click="goTryOn"
          >
            Essayage virtuel 3D
          </button>
        </div>
      </div>

    </div>
  </div>

  <div v-else class="flex flex-col items-center justify-center min-h-screen gap-3">
    <p class="text-gray-600">Monture introuvable</p>
    <NuxtLink to="/catalog">Retour catalogue</NuxtLink>
  </div>
</template>