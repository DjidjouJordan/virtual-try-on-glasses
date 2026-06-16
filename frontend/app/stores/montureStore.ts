import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import { useDB } from '~/composables/useDB'

export interface Monture {
  id: string
  modele: string
  prix: string
  description: string | null
  image_url: string | null
  modele3d_id: string
  modele3_d: {
    id: string
    url_fichier: string
    scale_offset: string
  }
}

export const useMontureStore = defineStore('monture', {
  state: () => ({
    montures: [] as Monture[],
    selected: null as Monture | null,
    loading: false,
  }),

  getters: {
    getById: (state) => (id: string) => state.montures.find(m => m.id === id),
  },

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { data, error } = await useFetch<Monture[]>('/api/montures', {
          baseURL: 'http://localhost:8000',
        })
        if (error.value) throw error.value
        this.montures = data.value ?? []
        // Persist to IndexedDB for offline use
        if (import.meta.client && this.montures.length) {
          const db = useDB()
          await db.montures.bulkPut(this.montures)
        }
      } catch {
        // Offline fallback: load from Dexie
        if (import.meta.client) {
          const db = useDB()
          this.montures = await db.montures.toArray()
        }
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id: string) {
      const { data } = await useFetch<Monture>(`/api/montures/${id}`, {
        baseURL: 'http://localhost:8000',
      })
      this.selected = data.value ?? null
      return this.selected
    },

    select(monture: Monture) {
      this.selected = monture
    },

    async create(payload: Partial<Monture>) {
      const auth = useAuthStore()
      const { data, error } = await useFetch('/api/montures', {
        method: 'POST',
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${auth.token}` },
        body: payload,
      })
      if (error.value) throw error.value
      await this.fetchAll()
      return data.value
    },

    async remove(id: string) {
      const auth = useAuthStore()
      await useFetch(`/api/montures/${id}`, {
        method: 'DELETE',
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      this.montures = this.montures.filter(m => m.id !== id)
    },
  },
})
