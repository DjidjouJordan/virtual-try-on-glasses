<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center">
    <div class="max-w-md">
      <span class="text-8xl md:text-9xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight animate-pulse">
        404
      </span>
      
      <h1 class="mt-4 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
        Oups ! Page hors de vue.
      </h1>
      
      <p class="mt-4 text-base text-gray-500 dark:text-gray-400">
        Il semblerait que cette page ait échappé à notre champ de vision. Elle n'existe pas ou a été déplacée.
      </p>

      <div class="mt-8 flex justify-center gap-4">
        <UButton
          class="cursor-pointer"
          size="lg"
          color="info"
          variant="solid"
          label="Retourner à l'accueil"
          icon="i-heroicons-home"
          @click="handleError"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Nuxt passe automatiquement l'objet error en prop dans ce fichier
const props = defineProps({
  error: {
    type: Object,
    default: () => ({})
  }
})

// Fonction indispensable sous Nuxt pour effacer l'erreur système et rediriger proprement sans casser le routeur Vue
const handleError = () => {
  clearError({ redirect: '/' })
}
</script>