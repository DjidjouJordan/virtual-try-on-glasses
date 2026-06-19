import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'

export interface Stats {
  total_users: number
  total_clients: number
  total_montures: number
  total_snapshots: number
  recent_montures: any[]
  recent_snapshots: any[]
}

export const useStatsStore = defineStore('stats', {
  state: () => ({
    stats: null as Stats | null,
    loading: false
  }),

  actions: {
    async fetchStats() {
      const config = useRuntimeConfig()
      const auth = useAuthStore()
      this.loading = true
      try {
        this.stats = await $fetch<Stats>(`${config.public.apiBase}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            Accept: 'application/json'
          }
        })
      } finally {
        this.loading = false
      }
    }
  }
})
