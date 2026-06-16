<script setup lang="ts">
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
    const { data, error } = await useFetch('/api/profile', {
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
          title="Déconnexion"
          @click="auth.logout()"
        >
          <UIcon name="i-lucide-log-out" class="w-4 h-4 text-gray-500 hover:text-red-500" />
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
      <div class="md:grid md:grid-cols-3 md:gap-8">

        <!-- ── LEFT: User card ── -->
        <div class="md:col-span-1 space-y-4">

          <!-- User card -->
          <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-5 md:p-6 text-white">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <UIcon name="i-lucide-user-round" class="w-7 h-7 text-white" />
              </div>
              <div class="min-w-0">
                <p class="font-extrabold text-lg leading-tight truncate">{{ auth.user?.nom ?? '—' }}</p>
                <p class="text-blue-200 text-xs mt-0.5 truncate">{{ auth.user?.email ?? '' }}</p>
              </div>
            </div>

            <!-- PD info -->
            <div class="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
              <UIcon name="i-lucide-ruler" class="w-4 h-4 text-blue-200 shrink-0" />
              <div>
                <p class="text-[10px] text-blue-200 font-bold">Écart Pupillaire</p>
                <p class="text-sm font-extrabold text-white">
                  {{ auth.user?.client?.ecart_pupillaire ? `${auth.user.client.ecart_pupillaire} mm` : 'Non renseigné' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-2xl p-4 text-center">
              <p class="text-2xl font-extrabold text-orange-500">{{ favoriStore.favoris.length }}</p>
              <p class="text-xs text-gray-500 mt-0.5">Favoris</p>
            </div>
            <div class="bg-gray-50 rounded-2xl p-4 text-center">
              <p class="text-2xl font-extrabold text-blue-700">{{ snapshotStore.snapshots.length }}</p>
              <p class="text-xs text-gray-500 mt-0.5">Snapshots</p>
            </div>
          </div>

          <!-- Forme visage -->
          <div v-if="auth.user?.client?.forme_visage" class="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
            <UIcon name="i-lucide-scan-face" class="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Forme du visage</p>
              <p class="text-sm font-bold text-gray-800 capitalize">{{ auth.user.client.forme_visage }}</p>
            </div>
          </div>

        </div>

        <!-- ── RIGHT: Tabs content ── -->
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
              class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
              :class="activeTab === tab.key
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'"
              @click="activeTab = tab.key as typeof activeTab"
            >
              <UIcon :name="tab.icon" class="w-3.5 h-3.5" />
              {{ tab.label }}
            </button>
          </div>

          <!-- ── FAVORIS ── -->
          <div v-if="activeTab === 'favoris'">
            <div v-if="favoriStore.favoris.length === 0" class="py-16 text-center">
              <UIcon name="i-lucide-heart" class="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p class="text-sm text-gray-400">Aucun favori pour l'instant.</p>
              <NuxtLink to="/catalog" class="text-blue-600 text-sm font-bold mt-2 inline-block hover:underline">
                Explorer le catalogue →
              </NuxtLink>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-24 md:pb-8">
              <div
                v-for="fav in favoriStore.favoris"
                :key="fav.id"
                class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <NuxtLink :to="`/glasses/${fav.monture.id}`">
                  <div class="w-full h-32 flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-100">
                    <img v-if="fav.monture.image_url" :src="fav.monture.image_url" :alt="fav.monture.modele" class="w-full h-full object-cover">
                    <UIcon v-else name="i-lucide-glasses" class="w-12 h-12 text-blue-300 opacity-50" />
                  </div>
                </NuxtLink>
                <div class="p-3 flex items-center justify-between">
                  <div class="min-w-0">
                    <p class="font-bold text-gray-900 text-sm truncate">{{ fav.monture.modele }}</p>
                    <p class="text-blue-600 font-extrabold text-sm">{{ formatPrice(fav.monture.prix) }}</p>
                  </div>
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 transition-colors shrink-0"
                    @click="favoriStore.remove(fav.monture_id)"
                  >
                    <UIcon name="i-lucide-heart-off" class="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ── SNAPSHOTS ── -->
          <div v-else-if="activeTab === 'snapshots'">
            <div v-if="snapshotStore.snapshots.length === 0" class="py-16 text-center">
              <UIcon name="i-lucide-camera-off" class="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p class="text-sm text-gray-400">Aucun snapshot pour l'instant.</p>
              <NuxtLink to="/try-on" class="text-blue-600 text-sm font-bold mt-2 inline-block hover:underline">
                Essayer des lunettes →
              </NuxtLink>
            </div>
            <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3 pb-24 md:pb-8">
              <div
                v-for="snap in snapshotStore.snapshots"
                :key="snap.id"
                class="relative rounded-2xl overflow-hidden bg-gray-900 aspect-square group"
              >
                <img :src="snap.image_url" :alt="`Snapshot ${snap.id}`" class="w-full h-full object-cover opacity-90">
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    class="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-colors"
                    @click="snapshotStore.download(snap)"
                  >
                    <UIcon name="i-lucide-download" class="w-4 h-4 text-gray-800" />
                  </button>
                  <button
                    class="w-9 h-9 flex items-center justify-center rounded-full bg-red-500/90 hover:bg-red-600 transition-colors"
                    @click="snapshotStore.remove(snap.id)"
                  >
                    <UIcon name="i-lucide-trash-2" class="w-4 h-4 text-white" />
                  </button>
                </div>
                <p class="absolute bottom-1.5 left-2 text-[9px] text-white/60">
                  {{ new Date(snap.date_capture).toLocaleDateString('fr-FR') }}
                </p>
              </div>
            </div>
          </div>

          <!-- ── PARAMÈTRES ── -->
          <div v-else-if="activeTab === 'parametres'" class="pb-24 md:pb-8 space-y-4 max-w-sm">
            <div v-if="saveSuccess" class="flex items-center gap-2 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-green-500 shrink-0" />
              <p class="text-sm text-green-600 font-medium">Profil mis à jour avec succès.</p>
            </div>
            <div v-if="saveError" class="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <UIcon name="i-lucide-circle-alert" class="w-4 h-4 text-red-500 shrink-0" />
              <p class="text-sm text-red-600 font-medium">{{ saveError }}</p>
            </div>

            <!-- Ecart pupillaire -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Écart Pupillaire (mm)</label>
              <input
                v-model.number="editEcart"
                type="number"
                min="40"
                max="100"
                step="0.5"
                placeholder="Ex: 62"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
              <p class="text-[10px] text-gray-400">Entre 40 et 100 mm. Mesuré par un opticien ou via le try-on.</p>
            </div>

            <!-- Forme visage -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Forme du visage</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="opt in formeOptions"
                  :key="opt.value"
                  class="py-2.5 rounded-2xl text-xs font-bold border-2 transition-all"
                  :class="editForme === opt.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-blue-300'"
                  @click="editForme = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <button
              :disabled="saving"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
              @click="saveProfile"
            >
              <UIcon v-if="saving" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
              {{ saving ? 'Sauvegarde…' : 'Enregistrer' }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
