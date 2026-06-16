// composables/useMonturesApi.ts

export interface Monture {
  id: number
  nom: string
  marque: string
  prix: number
  description: string
  categorie: string
  couleur: string
  image: {
    original: string
    thumb: string
    preview: string
    webp: string
  }
  modele3d: {
    id: number
    url: string
  } | null
}

export const useMontureApi = () => {
  const config = useRuntimeConfig() 

  const baseURL = config.public.apiBase || 'http://localhost:8000/api'

  async function fetchMontures() {
    const { data } = await useFetch(`${baseURL}/montures`)
    return data.value?.data || []
  }

  async function fetchMontureById(id: number) {
    const { data } = await useFetch(`${baseURL}/montures/${id}`)
    return data.value?.data || null
  }

  return {
    fetchMontures,
    fetchMontureById
  }
}
