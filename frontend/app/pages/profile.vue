<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import { useFavoriStore } from '~/stores/favoriStore'
import { useSnapshotStore } from '~/stores/snapshotStore'
import FileUploader from '~/components/FileUploader.vue'

definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const favoriStore = useFavoriStore()
const snapshotStore = useSnapshotStore()

const activeTab = ref<'favoris' | 'snapshots' | 'parametres'>('favoris')

// Notifications / Messages d'état globaux
const saveError = ref('')
const saveSuccess = ref(false)

/* =========================================================
👤 MODIFICATION DES INFOS GENERALES & TECHNIQUES
========================================================= */
const editNom = ref('')
const editEcart = ref<number | null>(null)
const editForme = ref<string | null>(null)
const saving = ref(false)

const formeOptions = [
  { value: 'ovale', label: 'Ovale' },
  { value: 'rond', label: 'Rond' },
  { value: 'carre', label: 'Carré' },
  { value: 'coeur', label: 'Cœur' },
  { value: 'rectangle', label: 'Rectangle' },
]

function initForm() {
  editNom.value = auth.user?.nom ?? ''
  editEcart.value = auth.user?.client?.ecart_pupillaire ?? null
  editForme.value = auth.user?.client?.forme_visage ?? null
}

async function saveProfile() {
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true
  try {
    // 1. Envoi au endpoint Laravel profile (Nom, Écart, Forme)
    const { error } = await useFetch('/api/profile', {
      method: 'PUT',
      baseURL: 'http://localhost:8000',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: {
        nom: editNom.value,
        ecart_pupillaire: editEcart.value,
        forme_visage: editForme.value,
      },
    })
    
    if (error.value) throw error.value
    
    // Mettre à jour l'état Pinia global
    if (auth.user) {
      auth.user.nom = editNom.value
      if (auth.user.client) {
        auth.user.client.ecart_pupillaire = editEcart.value
        auth.user.client.forme_visage = editForme.value
      }
      auth.persist()
    }

    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: any) {
    saveError.value = e?.data?.message ?? 'Erreur lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}

/* =========================================================
📸 GESTION DE L'AVATAR (FILE UPLOAD)
========================================================= */
const uploadingAvatar = ref(false)

async function handleAvatarUpdate(base64Image: string) {
  saveError.value = ''
  uploadingAvatar.value = true
  try {
    // Utilise l'action de ton authStore existante qui envoie le payload au serveur
    await auth.updateProfile({ avatar: base64Image })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: any) {
    saveError.value = e?.data?.message ?? "Impossible d'importer l'avatar."
  } finally {
    uploadingAvatar.value = false
  }
}

function handleAvatarError(message: string) {
  saveError.value = message
  setTimeout(() => { saveError.value = '' }, 4000)
}

/* =========================================================
🔒 SÉCURITÉ : CHANGEMENT DE MOT DE PASSE
========================================================= */
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

async function handleUpdatePassword() {
  passwordError.value = ''
  passwordSuccess.value = false

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'La confirmation du mot de passe ne correspond pas.'
    return
  }

  changingPassword.value = true
  try {
    await auth.changePassword(oldPassword.value, newPassword.value)
    passwordSuccess.value = true
    
    // Reset du formulaire
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    
    setTimeout(() => { passwordSuccess.value = false }, 3000)
  } catch (e: any) {
    passwordError.value = e?.data?.message ?? 'Ancien mot de passe incorrect.'
  } finally {
    changingPassword.value = false
  }
}

/* =========================================================
❤️ FAVORIS LOGIC
========================================================= */
const animatingFav = ref<string | null>(null)
async function toggleFavori(montureId: string) {
  if (animatingFav.value === montureId) return
  animatingFav.value = montureId
  try {
    if (favoriStore.isFavori(montureId)) {
      await favoriStore.remove(montureId)
    } else {
      await favoriStore.add(montureId)
    }
  } finally {
    setTimeout(() => { animatingFav.value = null }, 400)
  }
}

/* =========================================================
SNAPSHOTS LOGIC
========================================================= */
const deletingSnapshot = ref<number | null>(null)
async function deleteSnapshot(mediaId: number) {
  if (deletingSnapshot.value === mediaId) return
  deletingSnapshot.value = mediaId
  try {
    await snapshotStore.remove(mediaId)
  } catch (error) {
    console.error(error)
  } finally {
    deletingSnapshot.value = null
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
    <div class="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <UIcon name="i-lucide-user-round" class="w-4 h-4 text-blue-600" />
          <span class="text-sm font-bold text-gray-700">Mon Profil</span>
        </div>
        <button class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 transition-colors" @click="auth.logout()">
          <UIcon name="i-lucide-log-out" class="w-4 h-4 text-gray-500 hover:text-red-500" />
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
      <div class="md:grid md:grid-cols-3 md:gap-8">
        
        <div class="md:col-span-1 space-y-4">
          <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-5 md:p-6 text-white text-center md:text-left">
            <div class="flex flex-col md:flex-row items-center gap-4 mb-2">
              
              <FileUploader 
                :model-value="auth.user?.avatar_url" 
                :name="auth.user?.nom ?? 'U'" 
                :loading="uploadingAvatar"
                @update:avatar="handleAvatarUpdate"
                @error="handleAvatarError"
              />

              <div class="mt-2 md:mt-0">
                <p class="font-extrabold text-lg leading-tight">{{ auth.user?.nom ?? '—' }}</p>
                <p class="text-blue-200 text-xs mt-0.5">{{ auth.user?.email ?? '' }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-2xl p-4 text-center">
              <p class="text-2xl font-extrabold text-orange-500">{{ favoriStore.favoris.length }}</p>
              <p class="text-xs text-gray-500">Favoris</p>
            </div>
            <div class="bg-gray-50 rounded-2xl p-4 text-center">
              <p class="text-2xl font-extrabold text-blue-700">{{ snapshotStore.images.length }}</p>
              <p class="text-xs text-gray-500">Snapshots</p>
            </div>
          </div>
        </div>

        <div class="md:col-span-2 mt-6 md:mt-0">
          <div class="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5">
            <button 
              v-for="tab in [
                { key: 'favoris', label: 'Mes Favoris', icon: 'i-lucide-heart' },
                { key: 'snapshots', label: 'Snapshots', icon: 'i-lucide-camera' },
                { key: 'parametres', label: 'Paramètres', icon: 'i-lucide-settings' }
              ]" 
              :key="tab.key" 
              class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
              :class="activeTab === tab.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'"
              @click="activeTab = tab.key as any"
            >
              <UIcon :name="tab.icon" class="w-3.5 h-3.5" /> {{ tab.label }}
            </button>
          </div>

          <div v-if="activeTab === 'favoris'">
            <div v-if="favoriStore.favoris.length === 0" class="py-16 text-center">
              <UIcon name="i-lucide-heart" class="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p class="text-sm text-gray-400">Aucun favori.</p>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div v-for="fav in favoriStore.favoris" :key="fav.id" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <NuxtLink :to="`/glasses/${fav.monture.id}`">
                  <div class="w-full h-32 bg-gradient-to-br from-indigo-50 to-blue-100">
                    <img v-if="fav.monture.image_url" :src="fav.monture.image_url" class="w-full h-full object-cover" />
                  </div>
                </NuxtLink>
                <div class="p-3 flex justify-between items-center">
                  <div>
                    <p class="font-bold text-sm">{{ fav.monture.modele }}</p>
                    <p class="text-blue-600 font-extrabold text-sm">{{ formatPrice(fav.monture.prix) }}</p>
                  </div>
                  <button 
                    class="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300"
                    :class="favoriStore.isFavori(fav.monture_id) ? 'bg-red-500 scale-110' : 'bg-red-50'"
                    @click="toggleFavori(fav.monture_id)"
                  >
                    <UIcon 
                      name="i-lucide-heart" 
                      class="w-4 h-4 transition-all duration-300"
                      :class="favoriStore.isFavori(fav.monture_id) ? 'text-white animate-pulse' : 'text-red-500'" 
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'snapshots'">
            <div v-if="snapshotStore.images.length === 0" class="py-16 text-center">
              <UIcon name="i-lucide-camera-off" class="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p class="text-sm text-gray-400">Aucune capture enregistrée.</p>
            </div>

            <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div v-for="img in snapshotStore.images" :key="img.id" class="relative group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <img :src="img.thumb_url || img.image_url" class="w-full h-40 object-cover" />

                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                  <button @click="snapshotStore.download(img)" class="w-10 h-10 rounded-full bg-white text-gray-700 flex items-center justify-center hover:scale-110 transition">
                    <UIcon name="i-lucide-download" class="w-4 h-4" />
                  </button>
                  <button @click="deleteSnapshot(img.id)" :disabled="deletingSnapshot === img.id" class="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition disabled:opacity-50">
                    <UIcon v-if="deletingSnapshot !== img.id" name="i-lucide-trash-2" class="w-4 h-4" />
                    <UIcon v-else name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
                  </button>
                </div>
                <div class="p-2">
                  <p class="text-[11px] text-gray-500">
                    {{ new Date(img.date_capture || img.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'parametres'" class="pb-24 md:pb-8 space-y-6 max-w-xl">
            
            <div v-if="saveSuccess" class="flex items-center gap-2 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-green-500 shrink-0" />
              <p class="text-sm text-green-600 font-medium">Profil mis à jour avec succès.</p>
            </div>
            <div v-if="saveError" class="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <UIcon name="i-lucide-circle-alert" class="w-4 h-4 text-red-500 shrink-0" />
              <p class="text-sm text-red-600 font-medium">{{ saveError }}</p>
            </div>

            <div class="bg-gray-50/50 border border-gray-100 rounded-3xl p-5 space-y-4">
              <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <UIcon name="i-lucide-user" class="w-3.5 h-3.5" /> Informations Générales
              </h3>
              
              <div class="space-y-1.5">
                <label class="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Nom complet</label>
                <input v-model="editNom" type="text" placeholder="Ton nom" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              </div>

              <div class="space-y-1.5">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Adresse Email (Non modifiable)</label>
                <input :value="auth.user?.email" type="email" disabled class="w-full px-4 py-3 bg-gray-100 border border-gray-200 text-gray-400 rounded-2xl text-sm cursor-not-allowed" />
              </div>

              <div class="space-y-1.5">
                <label class="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Écart Pupillaire (mm)</label>
                <input v-model.number="editEcart" type="number" min="40" max="100" step="0.5" placeholder="Ex: 62" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                <p class="text-[10px] text-gray-400">Entre 40 et 100 mm. Donnée utilisée pour ajuster les lunettes 3D.</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Forme du visage</label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button v-for="opt in formeOptions" :key="opt.value" class="py-2.5 rounded-2xl text-xs font-bold border-2 transition-all" :class="editForme === opt.value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-blue-300'" @click="editForme = opt.value">
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <button :disabled="saving" class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2" @click="saveProfile">
                <UIcon v-if="saving" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
                {{ saving ? 'Sauvegarde…' : 'Enregistrer les modifications' }}
              </button>
            </div>

            <div class="bg-gray-50/50 border border-gray-100 rounded-3xl p-5 space-y-4">
              <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <UIcon name="i-lucide-shield-check" class="w-3.5 h-3.5" /> Sécurité & Mot de Passe
              </h3>

              <div v-if="passwordSuccess" class="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-xs text-green-600 font-medium">
                <UIcon name="i-lucide-check" class="w-3.5 h-3.5" /> Mot de passe modifié avec succès !
              </div>
              <div v-if="passwordError" class="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600 font-medium">
                <UIcon name="i-lucide-circle-alert" class="w-3.5 h-3.5" /> {{ passwordError }}
              </div>

              <div class="space-y-1.5">
                <label class="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Mot de passe actuel</label>
                <input v-model="oldPassword" type="password" placeholder="••••••••" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Nouveau mot de passe</label>
                  <input v-model="newPassword" type="password" placeholder="Minimum 6 caractères" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Confirmer le mot de passe</label>
                  <input v-model="confirmPassword" type="password" placeholder="Confirmer" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
              </div>

              <button :disabled="changingPassword || !oldPassword || !newPassword || !confirmPassword" class="w-full bg-gray-900 hover:bg-black disabled:opacity-40 text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2" @click="handleUpdatePassword">
                <UIcon v-if="changingPassword" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
                Changer le mot de passe
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>