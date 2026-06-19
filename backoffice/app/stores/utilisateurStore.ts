import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'

export interface Utilisateur {
  id: string
  nom: string
  email: string
  role: 'client' | 'admin'
  email_verified_at: string | null
  created_at: string
  avatar_url: string | null
  client?: {
    id: string
    ecart_pupillaire: number | null
    forme_visage: string | null
  } | null
}

export const useUtilisateurStore = defineStore('utilisateur', {
  state: () => ({
    utilisateurs: [] as Utilisateur[],
    selected: null as Utilisateur | null,
    loading: false,
    pagination: { current_page: 1, last_page: 1, total: 0 }
  }),

  actions: {
    async fetchAll(page = 1) {
      const config = useRuntimeConfig()
      const auth = useAuthStore()
      this.loading = true
      try {
        const res = await $fetch<any>(`${config.public.apiBase}/admin/users`, {
          query: { page },
          headers: {
            Authorization: `Bearer ${auth.token}`,
            Accept: 'application/json'
          }
        })
        this.utilisateurs = res.data ?? []
        this.pagination = {
          current_page: res.current_page ?? 1,
          last_page: res.last_page ?? 1,
          total: res.total ?? 0
        }
      } finally {
        this.loading = false
      }
    }
  }
})
