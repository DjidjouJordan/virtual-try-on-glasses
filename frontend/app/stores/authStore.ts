import { defineStore } from 'pinia'

interface User {
  id: string
  nom: string
  email: string
  role: 'client' | 'admin'
  avatar_url?: string | null
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
      try {
        const data = await $fetch<any>('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          },
          body: { nom, email, password }
        })

        this.pendingEmail = email
        return data
      } catch (error: any) {
        throw error
      }
    },

    /* =========================
       REGISTER STEP 2 (SEND OTP)
       ========================= */
    async sendRegisterOtp(email: string) {
      try {
        await $fetch('http://localhost:8000/api/auth/register/otp', {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          },
          body: { email }
        })

        this.pendingEmail = email
      } catch (error: any) {
        throw error
      }
    },

    /* =========================
       REGISTER STEP 3 (VERIFY OTP)
       ========================= */
    async verifyRegisterOtp(email: string, code: string) {
      try {
        const data = await $fetch<User>('http://localhost:8000/api/auth/register/verify', {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          },
          body: { email, code }
        })

        this.user = data
        return data
      } catch (error: any) {
        throw error
      }
    },

    /* =========================
       LOGIN (PASSWORD ONLY)
       ========================= */
    async login(email: string, password: string) {
      try {
        const res = await $fetch<any>('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          },
          body: { email, password }
        })

        this.user = res.user
        this.token = res.token

        this.persist()
        return res
      } catch (error: any) {
        throw error
      }
    },

    /* =========================
       RESET PASSWORD OTP
       ========================= */
    async sendResetOtp(email: string) {
      try {
        await $fetch('http://localhost:8000/api/auth/password/forgot', {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          },
          body: { email }
        })
        this.pendingEmail = email
      } catch (error: any) {
        throw error
      }
    },

    async resetPassword(email: string, code: string, password: string) {
      try {
        await $fetch('http://localhost:8000/api/auth/password/reset', {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          },
          body: { email, code, password }
        })
      } catch (error: any) {
        throw error
      }
    },

    /* =========================
       UPDATE PROFILE (Maintenant lié à ProfileController)
       ========================= */
    async updateProfile(payload: any) {
      try {
        const data = await $fetch<User>('http://localhost:8000/api/profile', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/json'
          },
          body: payload
        })

        // On assigne directement data car le contrôleur retourne l'objet User
        this.user = data
        
        // On sauvegarde dans le localStorage pour le rafraîchissement
        this.persist()
        
        return data
      } catch (error: any) {
        throw error
      }
    },

    /* =========================
       CHANGE PASSWORD (LOGGED IN)
       ========================= */
    async changePassword(old_password: string, new_password: string) {
      try {
        await $fetch('http://localhost:8000/api/auth/password/change', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/json'
          },
          body: { old_password, new_password }
        })
      } catch (error: any) {
        throw error
      }
    },

    /* =========================
       LOGOUT
       ========================= */
    async logout() {
      if (this.token) {
        try {
          await $fetch('http://localhost:8000/api/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.token}`,
              Accept: 'application/json'
            }
          })
        } catch (error) {
          console.error('Erreur lors de la déconnexion côté serveur:', error)
        }
      }

      this.token = null
      this.user = null

      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }

      // Redirection après déconnexion (généralement '/' pour l'accueil)
      navigateTo('/')
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