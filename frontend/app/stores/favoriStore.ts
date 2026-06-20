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

      const { public: { apiBase } } = useRuntimeConfig()
      try {
        const data = await $fetch<Favori[]>(`${apiBase}/favoris`, {
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            Accept: 'application/json'
          },
        })
        this.favoris = data ?? []
      } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error)
      }
    },

    async add(montureId: string) {
      const auth = useAuthStore()
      const { public: { apiBase } } = useRuntimeConfig()

      try {
        const data = await $fetch<Favori>(`${apiBase}/favoris`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            Accept: 'application/json'
          },
          body: { monture_id: montureId },
        })

        if (data) this.favoris.push(data)
        return data
      } catch (error) {
        console.error('Erreur lors de l\'ajout du favori:', error)
        throw error
      }
    },

    async remove(montureId: string) {
      const auth = useAuthStore()

      const fav = this.favoris.find(f => f.monture_id === montureId)
      if (!fav) return

      const { public: { apiBase } } = useRuntimeConfig()
      try {
        await $fetch(`${apiBase}/favoris/${fav.id}`, {
          method: 'DELETE',
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            Accept: 'application/json'
          },
        })

        // Mise à jour de l'état local filtré par l'ID du favori
        this.favoris = this.favoris.filter(f => f.id !== fav.id)
      } catch (error) {
        console.error('Erreur lors de la suppression du favori:', error)
        throw error
      }
    },

    async toggle(montureId: string) {
      if (this.isFavori(montureId)) {
        await this.remove(montureId)
      } else {
        await this.add(montureId)
      }
    },
  },
})