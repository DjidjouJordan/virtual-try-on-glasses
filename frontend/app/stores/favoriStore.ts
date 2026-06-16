import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import { useDB } from '~/composables/useDB'
import type { Monture } from './montureStore'

interface Favori {
  id: string
  client_id: string
  monture_id: string
  date_ajout: string
  monture: Monture
}

export const useFavoriStore = defineStore('favori', {
  state: () => ({
    favoris: [] as Favori[],
  }),

  getters: {
    isFavori: (state) => (montureId: string) =>
      state.favoris.some(f => f.monture_id === montureId),
    ids: (state) => state.favoris.map(f => f.monture_id),
  },

  actions: {
    async fetchAll() {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return
      try {
        const { data, error } = await useFetch<Favori[]>('/api/favoris', {
          baseURL: 'http://localhost:8000',
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        if (error.value) throw error.value
        this.favoris = data.value ?? []
        if (import.meta.client && this.favoris.length) {
          const db = useDB()
          await db.favoris.bulkPut(this.favoris)
        }
      } catch {
        if (import.meta.client) {
          const db = useDB()
          this.favoris = await db.favoris.toArray()
        }
      }
    },

    async add(montureId: string) {
      const auth = useAuthStore()
      const { data, error } = await useFetch('/api/favoris', {
        method: 'POST',
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${auth.token}` },
        body: { monture_id: montureId },
      })
      if (error.value) throw error.value
      await this.fetchAll()
      return data.value
    },

    async remove(montureId: string) {
      const auth = useAuthStore()
      const favori = this.favoris.find(f => f.monture_id === montureId)
      if (!favori) return
      await useFetch(`/api/favoris/${favori.id}`, {
        method: 'DELETE',
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      this.favoris = this.favoris.filter(f => f.monture_id !== montureId)
    },

    async toggle(montureId: string) {
      this.isFavori(montureId)
        ? await this.remove(montureId)
        : await this.add(montureId)
    },
  },
})
