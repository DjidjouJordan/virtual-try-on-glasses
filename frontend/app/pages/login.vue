<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

definePageMeta({ layout: false })

const auth = useAuthStore()
const router = useRouter()

if (auth.isAuthenticated) {
  await navigateTo('/catalog')
}

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true

  try {
    const res = await auth.login(email.value, password.value)

    if (!res?.user?.email_verified_at) {
      await auth.sendRegisterOtp(email.value)
      await navigateTo(`/verify-email?email=${email.value}`)
      return
    }

    await navigateTo('/catalog')

  } catch (e: any) {
    error.value = e?.data?.message ?? 'Identifiants incorrects.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">

      <!-- Logo -->
      <div class="flex flex-col items-center mb-8">
        <div class="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-3">
          <UIcon name="i-lucide-eye" class="w-8 h-8 text-white" />
        </div>
        <p class="text-2xl font-extrabold text-gray-900">DPGlasses</p>
        <p class="text-sm text-gray-500 mt-1">Connectez-vous à votre compte</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">

        <!-- Error -->
        <div v-if="error" class="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <UIcon name="i-lucide-circle-alert" class="w-4 h-4 text-red-500 shrink-0" />
          <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <!-- Email -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Email</label>
            <div class="relative">
              <UIcon name="i-lucide-mail" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="vous@exemple.com"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Mot de passe</label>
            <div class="relative">
              <UIcon name="i-lucide-lock" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <UIcon v-if="loading" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
            {{ loading ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>
      </div>

      <!-- Register link -->
      <p class="text-center text-sm text-gray-500 mt-6">
        Pas encore de compte ?
        <NuxtLink to="/register" class="text-blue-600 font-bold hover:underline">
          Créer un compte
        </NuxtLink>
      </p>

      <p class="text-center mt-4">
        <NuxtLink to="/" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Retour à l'accueil
        </NuxtLink>
      </p>

    </div>
  </div>
</template>
