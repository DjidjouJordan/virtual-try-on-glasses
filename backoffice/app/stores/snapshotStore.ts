import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'

export interface Snapshot {
  id: string
  client_id: string
  date_capture: string
  created_at: string
  media: Array<{
    id: number
    url: string
    thumb: string
    preview: string
  }>
}

export const useSnapshotStore = defineStore('snapshot', {
  state: () => ({
    snapshots: [] as Snapshot[],
    loading: false,
    pagination: { current_page: 1, last_page: 1, total: 0 }
  }),

  actions: {
    async fetchAll(page = 1) {
      const config = useRuntimeConfig()
      const auth = useAuthStore()
      this.loading = true
      try {
        const res = await $fetch<any>(`${config.public.apiBase}/admin/snapshots`, {
          query: { page },
          headers: {
            Authorization: `Bearer ${auth.token}`,
            Accept: 'application/json'
          }
        })
        this.snapshots = res.data ?? res ?? []
        if (res.current_page) {
          this.pagination = {
            current_page: res.current_page,
            last_page: res.last_page,
            total: res.total
          }
        }
      } finally {
        this.loading = false
      }
    },

    async destroy(id: string) {
      const config = useRuntimeConfig()
      const auth = useAuthStore()
      await $fetch(`${config.public.apiBase}/snapshots/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          Accept: 'application/json'
        }
      })
      this.snapshots = this.snapshots.filter(s => s.id !== id)
    }
  }
})
