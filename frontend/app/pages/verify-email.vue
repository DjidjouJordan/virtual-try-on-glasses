<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

definePageMeta({ layout: false })

const auth = useAuthStore()

const route = useRoute()

const email = ref(route.query.email as string)
const code = ref('')
const error = ref('')
const loading = ref(false)

async function verify() {
  error.value = ''
  loading.value = true

  try {
    const user = await auth.verifyRegisterOtp(email.value, code.value)

    auth.user = user

    await navigateTo('/login')

  } catch (e: any) {
    error.value = e?.data?.message ?? 'Code invalide'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-sm bg-white p-6 rounded-2xl shadow">

      <h1 class="text-lg font-bold mb-4">Vérification email</h1>

      <p class="text-sm text-gray-500 mb-4">
        Entrez le code envoyé à {{ email }}
      </p>

      <input
        v-model="code"
        maxlength="6"
        class="w-full border p-3 rounded mb-3 text-center tracking-widest text-lg"
        placeholder="123456"
      />

      <button
        @click="verify"
        class="w-full bg-blue-600 text-white p-3 rounded"
      >
        Vérifier
      </button>

      <p v-if="error" class="text-red-500 text-sm mt-2">
        {{ error }}
      </p>

    </div>
  </div>
</template>