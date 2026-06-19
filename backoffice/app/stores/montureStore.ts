import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'

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
  image_url: string
  image: { original: string; thumb: string; preview: string; webp: string }
  modele3d: {
    id: string
    scale_offset: string
    url: string
    file_name: string | null
    size: number | null
  } | null
}

interface Pagination {
  current_page: number
  last_page: number
  total: number
}

export const useMontureStore = defineStore('monture', {
  state: () => ({
    montures: [] as Monture[],
    selected: null as Monture | null,
    loading: false,
    pagination: { current_page: 1, last_page: 1, total: 0 } as Pagination
  }),

  actions: {
    async fetchAll(page = 1) {
      const config = useRuntimeConfig()
      const auth = useAuthStore()
      this.loading = true
      try {
        const res = await $fetch<any>(`${config.public.apiBase}/admin/montures`, {
          query: { page },
          headers: {
            Authorization: `Bearer ${auth.token}`,
            Accept: 'application/json'
          }
        })
        this.montures = res.data ?? []
        this.pagination = {
          current_page: res.current_page ?? 1,
          last_page: res.last_page ?? 1,
          total: res.total ?? 0
        }
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id: string) {
      const config = useRuntimeConfig()
      const auth = useAuthStore()
      this.loading = true
      try {
        const res = await $fetch<{ data: Monture }>(`${config.public.apiBase}/montures/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            Accept: 'application/json'
          }
        })
        this.selected = res.data ?? null
        return this.selected
      } finally {
        this.loading = false
      }
    },

    async create(formData: FormData) {
      const config = useRuntimeConfig()
      const auth = useAuthStore()
      const res = await $fetch<{ data: Monture }>(`${config.public.apiBase}/montures`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData
      })
      return res.data
    },

    async update(id: string, formData: FormData) {
      const config = useRuntimeConfig()
      const auth = useAuthStore()
      const res = await $fetch<{ data: Monture }>(`${config.public.apiBase}/montures/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData
      })
      return res.data
    },

    async destroy(id: string) {
      const config = useRuntimeConfig()
      const auth = useAuthStore()
      await $fetch(`${config.public.apiBase}/montures/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          Accept: 'application/json'
        }
      })
      this.montures = this.montures.filter(m => m.id !== id)
    }
  }
})
