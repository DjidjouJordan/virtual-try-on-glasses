<script setup lang="ts">
import { mockGlasses, useShop } from '~/composables/useShop'

const { formatPrice } = useShop()
const recommendations = mockGlasses.slice(0, 3)
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- Top Bar -->
    <div class="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-blue-600" />
          <span class="text-base font-extrabold text-gray-900 md:hidden">DPGlasses</span>
          <span class="hidden md:block text-sm font-bold text-gray-700">Mon Profil</span>
        </div>
        <button class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <UIcon name="i-lucide-settings" class="cursor-pointer w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
      <div class="md:grid md:grid-cols-3 md:gap-8">

        <!-- ── LEFT: Profile info ── -->
        <div class="md:col-span-1 space-y-4">
          <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-5 md:p-6 text-white">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center">
                <UIcon name="i-lucide-user-round" class="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <p class="font-extrabold text-lg md:text-xl leading-tight">Invité</p>
                <p class="text-blue-200 text-xs mt-0.5">Connectez-vous pour plus</p>
              </div>
            </div>
            <button class="cursor-pointer w-full bg-white text-blue-700 font-bold py-2.5 rounded-2xl text-sm hover:bg-blue-50 transition-colors">
              Se connecter / S'inscrire
            </button>
          </div>

          <!-- Stats (desktop) -->
          <div class="hidden md:grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-2xl p-4 text-center">
              <p class="text-2xl font-extrabold text-blue-700">0</p>
              <p class="text-xs text-gray-500 mt-0.5">Commandes</p>
            </div>
            <div class="bg-gray-50 rounded-2xl p-4 text-center">
              <p class="text-2xl font-extrabold text-orange-500">0</p>
              <p class="text-xs text-gray-500 mt-0.5">Favoris</p>
            </div>
          </div>
        </div>

        <!-- ── RIGHT: Recommendations ── -->
        <div class="md:col-span-2 mt-6 md:mt-0">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-4 h-0.5 bg-blue-600" />
            <p class="text-sm font-extrabold text-gray-900">Recommandations pour vous</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-24 md:pb-8">
            <NuxtLink
              v-for="item in recommendations"
              :key="item.id"
              :to="`/glasses/${item.id}`"
              class="block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div
                class="w-full flex items-center justify-center"
                style="height: 140px; background: linear-gradient(135deg, #1a1a2e, #16213e)"
              >
                <UIcon name="i-heroicons-eye" class="w-14 h-14 text-white opacity-10" />
              </div>
              <div class="p-3">
                <p class="font-bold text-gray-900 text-sm truncate">{{ item.name }}</p>
                <p class="text-blue-600 font-extrabold text-sm mt-0.5">{{ formatPrice(item.price) }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
