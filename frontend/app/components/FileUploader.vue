<script setup lang="ts">
interface Props {
  modelValue: string | null | undefined // URL de l'avatar actuel
  name: string // Nom du user pour le fallback initials
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  name: '—',
  loading: false
})

const emit = defineEmits(['update:avatar', 'error'])

const fileInput = ref<HTMLInputElement | null>(null)
const localPreview = ref<string | null>(null)

// Déclencher le clic sur le input masqué
function triggerSelect() {
  if (!props.loading) {
    fileInput.value?.click()
  }
}

// Validation et conversion en Base64
function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 1. Validation du type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    emit('error', 'Format invalide. Utilisez du PNG, JPG ou WebP.')
    return
  }

  // 2. Validation de la taille (Max 2 Mo)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    emit('error', 'Image trop lourde. Maximum 2 Mo.')
    return
  }

  // 3. Preview locale instantanée & Conversion Base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64String = e.target?.result as string
    localPreview.value = base64String // Affichage immédiat en front
    emit('update:avatar', base64String) // Envoi au composant parent
  }
  reader.readAsDataURL(file)
}

// Calcul des initiales si aucun avatar n'est disponible
const initials = computed(() => {
  return props.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div 
      @click="triggerSelect"
      class="relative group w-20 h-20 rounded-full border-2 border-white/30 shadow-md overflow-hidden cursor-pointer bg-white/10 flex items-center justify-center transition-all duration-300 hover:border-white"
    >
      <img 
        v-if="localPreview || modelValue" 
        :src="localPreview || modelValue!" 
        class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
        alt="Avatar"
      />
      
      <span v-else class="text-xl font-black text-white tracking-wider">
        {{ initials }}
      </span>

      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
        <UIcon name="i-lucide-camera" class="w-5 h-5 text-white" />
        <span class="text-[9px] font-bold mt-0.5">Modifier</span>
      </div>

      <div v-if="loading" class="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
        <UIcon name="i-lucide-loader-2" class="w-5 h-5 animate-spin text-white" />
      </div>
    </div>

    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      class="hidden" 
      @change="onFileSelected" 
    />
  </div>
</template>