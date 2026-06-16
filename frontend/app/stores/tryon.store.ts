import { ref } from 'vue'

export const useTryOnStore = () => {
  // URL du modèle 3D sélectionné
  const selectedModelUrl = ref<string | null>(null)

  // scale optionnel venant backend
  const selectedScale = ref<number>(1)

  function setModel(url: string, scale = 1) {
    selectedModelUrl.value = url
    selectedScale.value = scale
  }

  function clear() {
    selectedModelUrl.value = null
    selectedScale.value = 1
  }

  return {
    selectedModelUrl,
    selectedScale,
    setModel,
    clear
  }
}