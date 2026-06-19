import { defineStore } from 'pinia'

interface User {
  id: string
  nom: string
  email: string
  role: 'client' | 'admin'
  avatar_url?: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null
  }),

  getters: {
    isAuthenticated: state => !!state.token,
    isAdmin: state => state.user?.role === 'admin'
  },

  actions: {
    async login(email: string, password: string) {
      const config = useRuntimeConfig()
      const res = await $fetch<{ user: User; token: string }>(`${config.public.apiBase}/auth/login`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: { email, password }
      })

      this.user = res.user
      this.token = res.token
      this.persist()
      return res
    },

    async logout() {
      const config = useRuntimeConfig()
      if (this.token) {
        try {
          await $fetch(`${config.public.apiBase}/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.token}`,
              Accept: 'application/json'
            }
          })
        } catch {}
      }
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('bo_token')
        localStorage.removeItem('bo_user')
      }
      await navigateTo('/login')
    },

    restore() {
      if (!import.meta.client) return
      this.token = localStorage.getItem('bo_token')
      const raw = localStorage.getItem('bo_user')
      this.user = raw ? JSON.parse(raw) : null
    },

    persist() {
      if (!import.meta.client) return
      localStorage.setItem('bo_token', this.token ?? '')
      localStorage.setItem('bo_user', JSON.stringify(this.user))
    }
  }
})
