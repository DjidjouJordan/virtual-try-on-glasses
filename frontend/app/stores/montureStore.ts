import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import { useDB } from '~/composables/useDB'

export interface Monture {
  id: string
  nom: string
  marque: string | null
  prix: number
  description: string | null
  categorie: string | null
  couleur: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  image: {
    original: string
    thumb: string
    preview: string
    webp: string
  }
}

interface ApiResponse {
  data: {
    data: Monture[]
    meta: {
      current_page: number
      last_page: number
      total: number
    }
  }
}

export const useMontureStore = defineStore('monture', {
  state: () => ({
    montures: [] as Monture[],
    selected: null as Monture | null,
    loading: false,

    pagination: {
      current_page: 1,
      last_page: 1,
      total: 0
    }
  }),

  getters: {
    getById: (state) => (id: string) =>
      state.montures.find(m => m.id === id)
  },

  actions: {
    async fetchAll(page = 1) {
      this.loading = true

      try {
        const { data, error } = await useFetch<any>(
          '/api/montures',
          {
            baseURL: 'http://localhost:8000',
            query: { page }
          }
        )

        if (error.value) throw error.value

        // ✅ DEBUG IMPORTANT
        console.log('API RAW:', data.value)

        const response = data.value?.data

        this.montures = Array.isArray(response?.data)
          ? response.data
          : []

        // pagination
        this.pagination = {
          current_page: response?.current_page ?? 1,
          last_page: response?.last_page ?? 1,
          total: response?.total ?? 0
        }

        // 🟢 SAFE INDEXEDDB FIX
        if (import.meta.client) {
          const db = useDB()

          await db.montures.clear()

          await db.montures.bulkPut(
            JSON.parse(JSON.stringify(this.montures))
          )
        }
      } catch (err) {
        console.error('fetchAll error:', err)

        if (import.meta.client) {
          const db = useDB()
          this.montures = await db.montures.toArray()
        }
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id: string) {
      this.loading = true

      try {
        const { data, error } = await useFetch<{ data: Monture }>(
          `/api/montures/${id}`,
          { baseURL: 'http://localhost:8000' }
        )

        if (error.value) throw error.value

        this.selected = data.value?.data ?? null
        return this.selected
      } finally {
        this.loading = false
      }
    },

    add(m: Monture) {
      // ⚠️ sécurité panier
      this.montures.push(m)
    }
  }
})
