<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import { useFavoriStore } from '~/stores/favoriStore'
import { useSnapshotStore } from '~/stores/snapshotStore'

definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const favoriStore = useFavoriStore()
const snapshotStore = useSnapshotStore()

const activeTab = ref<'favoris' | 'snapshots' | 'parametres'>('favoris')

// Profile edit form
const editEcart = ref<number | null>(null)
const editForme = ref<string | null>(null)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

const formeOptions = [
  { value: 'ovale', label: 'Ovale' },
  { value: 'rond', label: 'Rond' },
  { value: 'carre', label: 'Carré' },
  { value: 'coeur', label: 'Cœur' },
  { value: 'rectangle', label: 'Rectangle' },
]

function initForm() {
  editEcart.value = auth.user?.client?.ecart_pupillaire ?? null
  editForme.value = auth.user?.client?.forme_visage ?? null
}

async function saveProfile() {
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true
  try {
    const { error } = await useFetch('/api/profile', {
      method: 'PUT',
      baseURL: 'http://localhost:8000',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: { ecart_pupillaire: editEcart.value, forme_visage: editForme.value },
    })
    if (error.value) throw error.value
    await auth.fetchMe()
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: any) {
    saveError.value = e?.data?.message ?? 'Erreur lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}

function formatPrice(prix: string | number): string {
  return parseFloat(String(prix)).toLocaleString('fr-FR') + ' FCFA'
}

/* =========================================================
   ❤️ FAVORIS ANIMATION LOGIC (LIKE / UNLIKE)
   ========================================================= */

const animatingFav = ref<string | null>(null)

async function toggleFavori(montureId: string) {
  if (animatingFav.value === montureId) return

  animatingFav.value = montureId

  try {
    const isFav = favoriStore.isFavori(montureId)

    // animation optimiste (UI instantané)
    if (isFav) {
      await favoriStore.remove(montureId)
    } else {
      await favoriStore.add(montureId)
    }
  } finally {
    setTimeout(() => {
      animatingFav.value = null
    }, 400)
  }
}

onMounted(async () => {
  await Promise.all([favoriStore.fetchAll(), snapshotStore.fetchAll()])
  initForm()
})
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- Top Bar -->
    <div class="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <UIcon name="i-lucide-user-round" class="w-4 h-4 text-blue-600" />
          <span class="text-sm font-bold text-gray-700">Mon Profil</span>
        </div>

        <button
          class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 transition-colors"
          @click="auth.logout()"
        >
          <UIcon name="i-lucide-log-out" class="w-4 h-4 text-gray-500 hover:text-red-500" />
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
      <div class="md:grid md:grid-cols-3 md:gap-8">

        <!-- LEFT -->
        <div class="md:col-span-1 space-y-4">

          <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-5 md:p-6 text-white">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <UIcon name="i-lucide-user-round" class="w-7 h-7 text-white" />
              </div>
              <div>
                <p class="font-extrabold text-lg">{{ auth.user?.nom ?? '—' }}</p>
                <p class="text-blue-200 text-xs">{{ auth.user?.email ?? '' }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-2xl p-4 text-center">
              <p class="text-2xl font-extrabold text-orange-500">{{ favoriStore.favoris.length }}</p>
              <p class="text-xs text-gray-500">Favoris</p>
            </div>
            <div class="bg-gray-50 rounded-2xl p-4 text-center">
              <p class="text-2xl font-extrabold text-blue-700">{{ snapshotStore.snapshots.length }}</p>
              <p class="text-xs text-gray-500">Snapshots</p>
            </div>
          </div>

        </div>

        <!-- RIGHT -->
        <div class="md:col-span-2 mt-6 md:mt-0">

          <!-- Tabs -->
          <div class="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5">
            <button
              v-for="tab in [
                { key: 'favoris', label: 'Mes Favoris', icon: 'i-lucide-heart' },
                { key: 'snapshots', label: 'Snapshots', icon: 'i-lucide-camera' },
                { key: 'parametres', label: 'Paramètres', icon: 'i-lucide-settings' }
              ]"
              :key="tab.key"
              class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
              :class="activeTab === tab.key
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500'"
              @click="activeTab = tab.key as any"
            >
              <UIcon :name="tab.icon" class="w-3.5 h-3.5" />
              {{ tab.label }}
            </button>
          </div>

          <!-- FAVORIS -->
          <div v-if="activeTab === 'favoris'">

            <div v-if="favoriStore.favoris.length === 0" class="py-16 text-center">
              <UIcon name="i-lucide-heart" class="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p class="text-sm text-gray-400">Aucun favori.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

              <div
                v-for="fav in favoriStore.favoris"
                :key="fav.id"
                class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >

                <NuxtLink :to="`/glasses/${fav.monture.id}`">
                  <div class="w-full h-32 bg-gradient-to-br from-indigo-50 to-blue-100">
                    <img
                      v-if="fav.monture.image_url"
                      :src="fav.monture.image_url"
                      class="w-full h-full object-cover"
                    />
                  </div>
                </NuxtLink>

                <div class="p-3 flex justify-between items-center">

                  <div>
                    <p class="font-bold text-sm">{{ fav.monture.modele }}</p>
                    <p class="text-blue-600 font-extrabold text-sm">
                      {{ formatPrice(fav.monture.prix) }}
                    </p>
                  </div>

                  <!-- ❤️ ANIMATED BUTTON -->
                  <button
                    class="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300"
                    :class="favoriStore.isFavori(fav.monture_id)
                      ? 'bg-red-500 scale-110'
                      : 'bg-red-50'"
                    @click="toggleFavori(fav.monture_id)"
                  >
                    <UIcon
                      name="i-lucide-heart"
                      class="w-4 h-4 transition-all duration-300"
                      :class="favoriStore.isFavori(fav.monture_id)
                        ? 'text-white animate-pulse'
                        : 'text-red-500'"
                    />
                  </button>

                </div>
              </div>

            </div>
          </div>

          <!-- SNAPSHOTS (unchanged) -->
          <div v-else-if="activeTab === 'snapshots'">
            <div v-if="snapshotStore.snapshots.length === 0" class="py-16 text-center">
              <UIcon name="i-lucide-camera-off" class="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p class="text-sm text-gray-400">Aucun snapshot.</p>
            </div>
          </div>

          <!-- PARAMETRES (unchanged) -->
          <div v-else-if="activeTab === 'parametres'">
            <p class="text-sm text-gray-500">Paramètres existants inchangés.</p>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>