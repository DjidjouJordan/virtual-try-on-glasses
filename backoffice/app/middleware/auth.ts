import { useAuthStore } from '~/stores/authStore'

export default defineNuxtRouteMiddleware((to) => {
  // SSR: skip, localStorage not available server-side
  if (import.meta.server) return

  const auth = useAuthStore()
  auth.restore()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  if (!auth.isAdmin) {
    return navigateTo('/login')
  }
})
