<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'DPGlasses'
const description = 'The intuitive VTO application made in Cameroon'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <span class="font-bold text-xl">DPGlasses</span>
        </NuxtLink>

        <UTabs :items="[{ label: 'Accueil', to: '/' }, { label: 'Essayer', to: '/try-on' }]" />
      </template>

      <template #right>
        <UColorModeButton />
        <UButton
          to="https://github.com/ton-repo/dpglasses"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator icon="i-lucide-glasses" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          DPGlasses • Essayage virtuel de lunettes en RA • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/ton-repo/dpglasses"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
