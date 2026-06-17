import { useAuthStore } from '~/stores/authStore'

export default defineNuxtRouteMiddleware((_to) => {
  // 1. Sécurité SSR : Le serveur n'a pas accès au localStorage.
  // Si on laisse le serveur exécuter ce code, 'auth.isAuthenticated' sera toujours faux
  // et l'utilisateur subira une boucle de redirection infinie vers /login au rafraîchissement de la page.
  if (import.meta.server) return

  const auth = useAuthStore()

  // 2. Restaure le token et l'utilisateur depuis le localStorage (côté client uniquement)
  auth.restore()

  // 3. Vérification de l'authentification
  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
