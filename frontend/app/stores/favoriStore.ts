import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
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

      const { data, error } = await useFetch<Favori[]>('/api/favoris', {
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${auth.token}` },
      })

      if (error.value) return
      this.favoris = data.value ?? []
    },

    async add(montureId: string) {
      const auth = useAuthStore()

      const { data, error } = await useFetch<Favori>('/api/favoris', {
        method: 'POST',
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${auth.token}` },
        body: { monture_id: montureId },
      })

      if (error.value) throw error.value

      // update optimiste
      if (data.value) this.favoris.push(data.value)

      return data.value
    },

    async remove(montureId: string) {
      const auth = useAuthStore()

      const fav = this.favoris.find(f => f.monture_id === montureId)
      if (!fav) return

      await useFetch(`/api/favoris/${fav.id}`, {
        method: 'DELETE',
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${auth.token}` },
      })

      this.favoris = this.favoris.filter(f => f.id !== fav.id)
    },

    async toggle(montureId: string) {
      return this.isFavori(montureId)
        ? await this.remove(montureId)
        : await this.add(montureId)
    },
  },
})