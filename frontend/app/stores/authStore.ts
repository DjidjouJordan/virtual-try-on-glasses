import { defineStore } from 'pinia'

interface User {
  id: string
  nom: string
  email: string
  role: 'client' | 'admin'
  email_verified_at?: string | null
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

    // état OTP flow
    pendingEmail: null as string | null
  }),

  getters: {
    isAuthenticated: state => !!state.token,
    isAdmin: state => state.user?.role === 'admin',
    isEmailVerified: state => !!state.user?.email_verified_at,
  },

  actions: {

    /* =========================
       REGISTER STEP 1 (CREATE USER)
       ========================= */
    async register(nom: string, email: string, password: string) {
      const { data, error } = await useFetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: { nom, email, password }
      })

      if (error.value) throw error.value

      this.pendingEmail = email
      return data.value
    },

    /* =========================
       REGISTER STEP 2 (SEND OTP)
       ========================= */
    async sendRegisterOtp(email: string) {
      const { error } = await useFetch('http://localhost:8000/api/auth/register/otp', {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: { email }
      })

      if (error.value) throw error.value

      this.pendingEmail = email
    },

    /* =========================
       REGISTER STEP 3 (VERIFY OTP)
       ========================= */
    async verifyRegisterOtp(email: string, code: string) {
      const { data, error } = await useFetch('http://localhost:8000/api/auth/register/verify', {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: { email, code }
      })

      if (error.value) throw error.value

      const user = data.value as User
      this.user = user

      return user
    },

    /* =========================
       LOGIN (PASSWORD ONLY)
       ========================= */
    async login(email: string, password: string) {
      const { data, error } = await useFetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: { email, password }
      })

      if (error.value) throw error.value

      const res = data.value as any

      this.user = res.user
      this.token = res.token

      this.persist()
      return res
    },

    /* =========================
       RESET PASSWORD OTP
       ========================= */
    async sendResetOtp(email: string) {
      const { error } = await useFetch('http://localhost:8000/api/auth/password/forgot', {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: { email }
      })

      if (error.value) throw error.value
      this.pendingEmail = email
    },

    async resetPassword(email: string, code: string, password: string) {
      const { error } = await useFetch('http://localhost:8000/api/auth/password/reset', {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: { email, code, password }
      })

      if (error.value) throw error.value
    },

    /* =========================
       UPDATE PROFILE
       ========================= */
    async updateProfile(payload: any) {
      const { data, error } = await useFetch('http://localhost:8000/api/auth/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/json'
        },
        body: payload
      })

      if (error.value) throw error.value

      this.user = data.value as User
      this.persist()
    },

    /* =========================
       CHANGE PASSWORD (LOGGED IN)
       ========================= */
    async changePassword(old_password: string, new_password: string) {
      const { error } = await useFetch('http://localhost:8000/api/auth/password/change', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/json'
        },
        body: { old_password, new_password }
      })

      if (error.value) throw error.value
    },

    /* =========================
       LOGOUT
       ========================= */
    async logout() {
      if (this.token) {
        await useFetch('http://localhost:8000/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/json'
          }
        })
      }

      this.token = null
      this.user = null

      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    },

    /* =========================
       RESTORE SESSION
       ========================= */
    restore() {
      if (!import.meta.client) return

      this.token = localStorage.getItem('auth_token')
      const raw = localStorage.getItem('auth_user')

      this.user = raw ? JSON.parse(raw) : null
    },

    persist() {
      if (!import.meta.client) return

      localStorage.setItem('auth_token', this.token ?? '')
      localStorage.setItem('auth_user', JSON.stringify(this.user))
    }
  }
})
