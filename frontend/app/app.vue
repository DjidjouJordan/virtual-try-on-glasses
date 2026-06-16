<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

const auth = useAuthStore()
auth.restore()

const colorMode = useColorMode()

const footerLogo = computed(() => {
  return colorMode.value === 'dark'
    ? '/logo-dpglasses-dark.png'
    : '/logo-dpglasses-light.png'
})

const title = 'DPGlasses'

const description = 'La nouvelle génération d’essayage virtuel de lunettes. Visualisez instantanément vos montures en réalité augmentée avec une précision faciale avancée.'

useHead({
  htmlAttrs: {
    lang: 'fr'
  },

  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    }
  ],

  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    },

    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png'
    }
  ]
})

useSeoMeta({
  title,
  description,

  ogTitle: title,
  ogDescription: description,
  ogImage: '/og-image.png',

  twitterTitle: title,
  twitterDescription: description,
  twitterImage: '/og-image.png',

  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <div class="relative py-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-default"></div>
      </div>

      <div class="relative flex justify-center">
        <div class="bg-default px-4">
          <img
            :src="footerLogo"
            alt="DPGlasses"
            class="h-20 w-20 w-auto"
          >
        </div>
      </div>
    </div>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          © {{ new Date().getFullYear() }} DPGlasses
        </p>
      </template>

      <template #right>
        <p class="text-sm text-muted">
          Virtual Try-On • Three.js • MediaPipe
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
