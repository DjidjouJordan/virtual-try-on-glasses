export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  auth.restore()
  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
