<script setup lang="ts">
definePageMeta({ layout: false })

const slides = [
  {
    tag: 'INNOVATION',
    title: 'Essayage RA',
    description: 'Visualisez instantanément vos futures montures avec notre technologie de Réalité Augmentée clinique.',
    bgFrom: '#1e3a5f',
    bgTo: '#0f2240',
  },
  {
    tag: 'TECHNOLOGIE',
    title: 'Analyse Morphologique IA',
    description: 'Notre IA adapte les montures à la forme de votre visage pour un ajustement parfait et personnalisé.',
    bgFrom: '#1d4ed8',
    bgTo: '#1e40af',
  },
  {
    tag: 'ACCESSIBILITÉ',
    title: 'Payez avec MoMo',
    description: 'Commandez via MTN MoMo ou Orange Money. Livraison 48h à domicile partout au Cameroun.',
    bgFrom: '#064e3b',
    bgTo: '#065f46',
  },
]

const currentSlide = ref(0)
let timer: ReturnType<typeof setInterval>
onMounted(() => { timer = setInterval(() => { currentSlide.value = (currentSlide.value + 1) % slides.length }, 3500) })
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col md:flex-row">

    <!-- ── LEFT PANEL (desktop only) ── -->
    <div
      class="hidden md:flex md:w-1/2 lg:w-[55%] flex-col justify-between p-12 text-white"
      :style="`background: linear-gradient(135deg, ${slides[currentSlide].bgFrom}, ${slides[currentSlide].bgTo}); transition: background 0.6s ease`"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <UIcon name="i-lucide-eye" class="w-5 h-5 text-white" />
        </div>
        <div>
          <p class="text-xl font-extrabold">DPGlasses</p>
          <p class="text-xs text-white/60">L'optique intelligente à votre portée</p>
        </div>
      </div>

      <!-- Slide content -->
      <div class="space-y-6">
        <div>
          <span class="text-[11px] font-extrabold tracking-[0.2em] text-white/50 uppercase">
            {{ slides[currentSlide].tag }}
          </span>
          <h1 class="text-5xl font-extrabold leading-tight mt-2">
            {{ slides[currentSlide].title }}
          </h1>
          <p class="text-white/70 text-lg mt-4 leading-relaxed max-w-md">
            {{ slides[currentSlide].description }}
          </p>
        </div>

        <!-- Dots -->
        <div class="flex items-center gap-2">
          <button
            v-for="i in slides.length"
            :key="i"
            class="h-2 rounded-full transition-all duration-300 bg-white"
            :class="currentSlide === i - 1 ? 'w-8 opacity-100' : 'w-2 opacity-30'"
            @click="currentSlide = i - 1"
          />
        </div>
      </div>

      <!-- Features -->
      <div class="grid grid-cols-3 gap-4">
        <div v-for="feat in [
          { icon: 'i-lucide-scan-face', label: 'IA Morphologique' },
          { icon: 'i-lucide-glasses', label: 'Essayage RA' },
          { icon: 'i-lucide-shield-check', label: 'Données privées' },
        ]" :key="feat.label" class="text-center">
          <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-1.5">
            <UIcon :name="feat.icon" class="w-5 h-5 text-white" />
          </div>
          <p class="text-xs text-white/70 font-medium">{{ feat.label }}</p>
        </div>
      </div>
    </div>

    <!-- ── RIGHT PANEL / MOBILE FULL ── -->
    <div class="flex-1 flex flex-col items-center justify-between px-6 py-8 md:py-12 md:px-12 max-w-md mx-auto w-full md:max-w-none">

      <!-- Mobile logo -->
      <div class="flex flex-col items-center gap-1 pt-2 md:hidden">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-eye" class="w-6 h-6 text-blue-700" />
          <span class="text-xl font-extrabold text-gray-900">DPGlasses</span>
        </div>
        <p class="text-xs text-gray-400">L'optique intelligente à votre portée</p>
      </div>

      <!-- Desktop welcome text -->
      <div class="hidden md:block w-full">
        <h2 class="text-3xl font-extrabold text-gray-900">Bienvenue</h2>
        <p class="text-gray-500 mt-1">Commencez votre expérience d'essayage virtuel</p>
      </div>

      <!-- Mobile slide card -->
      <div class="w-full flex-1 flex flex-col items-center justify-center gap-4 py-6 md:hidden">
        <div
          class="w-full rounded-3xl overflow-hidden shadow-2xl relative"
          style="height: 280px;"
          :style="`background: linear-gradient(135deg, ${slides[currentSlide].bgFrom}, ${slides[currentSlide].bgTo})`"
        >
          <div class="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-10 bg-white" />
          <div class="absolute bottom-4 left-4 right-4">
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <span class="text-[11px] font-extrabold text-blue-200 tracking-[0.15em]">{{ slides[currentSlide].tag }}</span>
              <h2 class="text-2xl font-extrabold text-white mt-1 leading-tight">{{ slides[currentSlide].title }}</h2>
              <p class="text-white/70 text-sm mt-1.5 leading-relaxed">{{ slides[currentSlide].description }}</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-for="i in slides.length"
            :key="i"
            class="h-2 rounded-full transition-all duration-300 bg-blue-600"
            :class="currentSlide === i - 1 ? 'w-5 opacity-100' : 'w-2 opacity-30'"
            @click="currentSlide = i - 1"
          />
        </div>
      </div>

      <!-- CTA zone (both mobile + desktop) -->
      <div class="w-full space-y-4">
        <NuxtLink
          to="/catalog"
          class="block w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-center font-bold py-4 rounded-2xl transition-colors text-base shadow-lg shadow-blue-600/30"
        >
          Commencer l'expérience
        </NuxtLink>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex items-center gap-2.5 border border-gray-100 rounded-2xl p-3 bg-gray-50">
            <div class="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-ruler" class="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p class="text-[10px] font-extrabold text-gray-700 tracking-wider">MESURE PD</p>
              <p class="text-[9px] text-gray-400">Distance pupillaire</p>
            </div>
          </div>
          <div class="flex items-center gap-2.5 border border-gray-100 rounded-2xl p-3 bg-gray-50">
            <div class="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-credit-card" class="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p class="text-[10px] font-extrabold text-gray-700 tracking-wider">PAIEMENT</p>
              <p class="text-[9px] text-gray-400">MoMo & Orange</p>
            </div>
          </div>
        </div>

        <div class="text-center">
          <NuxtLink to="/profile" class="text-sm text-blue-600 font-semibold">
            Se connecter
          </NuxtLink>
        </div>
      </div>
    </div>

  </div>
</template>
