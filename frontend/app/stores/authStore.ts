import { defineStore } from 'pinia'

interface User {
  id: string
  nom: string
  email: string
  role: 'client' | 'admin'
  client?: {
    id: string
    ecart_pupillaire: number | null
    forme_visage: string | null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    clientId: (state) => state.user?.client?.id ?? null,
  },

  actions: {
    async register(nom: string, email: string, password: string, passwordConfirmation: string) {
      const { data, error } = await useFetch('/api/register', {
        method: 'POST',
        baseURL: 'http://localhost:8000',
        body: { nom, email, password, password_confirmation: passwordConfirmation },
      })
      if (error.value) throw error.value
      const res = data.value as any
      this.token = res.token
      this.user = res.user
      this._persist()
    },

    async login(email: string, password: string) {
      const { data, error } = await useFetch('/api/login', {
        method: 'POST',
        baseURL: 'http://localhost:8000',
        body: { email, password },
      })
      if (error.value) throw error.value
      const res = data.value as any
      this.token = res.token
      this.user = res.user
      this._persist()
    },

    async logout() {
      await useFetch('/api/logout', {
        method: 'POST',
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${this.token}` },
      })
      this.token = null
      this.user = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      navigateTo('/login')
    },

    async fetchMe() {
      if (!this.token) return
      const { data } = await useFetch('/api/me', {
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${this.token}` },
      })
      if (data.value) this.user = data.value as User
    },

    restore() {
      if (import.meta.client) {
        this.token = localStorage.getItem('auth_token')
        const raw = localStorage.getItem('auth_user')
        this.user = raw ? JSON.parse(raw) : null
      }
    },

    _persist() {
      if (import.meta.client) {
        localStorage.setItem('auth_token', this.token ?? '')
        localStorage.setItem('auth_user', JSON.stringify(this.user))
      }
    },
  },
})
