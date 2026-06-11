<script setup lang="ts">
import { mockGlasses, categories, useShop } from '~/composables/useShop'

const { addToCart, cartCount, formatPrice } = useShop()

const searchQuery = ref('')
const activeCategory = ref('Tout voir')

const filteredGlasses = computed(() => {
  let list = mockGlasses
  if (activeCategory.value !== 'Tout voir') {
    list = list.filter(g => g.category === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(g => g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q))
  }
  return list
})
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- ── TOP BAR ── -->
    <div class="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3">
      <div class="max-w-7xl mx-auto flex items-center gap-3">
        <!-- Location (mobile: show logo too) -->
        <div class="flex items-center gap-1.5 text-xs shrink-0">
          <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 text-blue-600" />
          <button class="font-bold text-gray-800 border-b-2 border-blue-600 pb-0.5">DOUALA</button>
          <span class="text-gray-300 mx-0.5">|</span>
          <button class="font-medium text-gray-400">YAOUNDE</button>
        </div>

        <!-- Mobile logo (hidden on desktop — sidebar has it) -->
        <span class="md:hidden flex-1 text-center text-base font-extrabold text-gray-900">DPGlasses</span>

        <!-- Desktop: spacer -->
        <div class="hidden md:flex flex-1" />

        <!-- Search (desktop: more prominent) -->
        <div class="hidden md:flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 w-80">
          <UIcon name="i-lucide-search" class="w-4 h-4 text-gray-400 shrink-0" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher des montures..."
            class="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
        </div>

        <!-- Icons -->
        <div class="flex items-center gap-2 shrink-0">
          <button class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100">
            <UIcon name="i-lucide-bell" class="w-4 h-4 text-gray-500" />
          </button>
          <NuxtLink to="/cart" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 relative">
            <UIcon name="i-lucide-shopping-bag" class="w-4 h-4 text-gray-500" />
            <span
              v-if="cartCount > 0"
              class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center"
            >{{ cartCount }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 md:px-8">

      <!-- Mobile search -->
      <div class="md:hidden flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-2.5 mt-3">
        <UIcon name="i-lucide-search" class="w-4 h-4 text-gray-400 shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher des montures..."
          class="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
        <UIcon name="i-lucide-sliders-horizontal" class="w-4 h-4 text-gray-400 shrink-0" />
      </div>

      <!-- Hero Card -->
      <div
        class="mt-4 rounded-3xl overflow-hidden relative"
        style="background: linear-gradient(135deg, #1d4ed8, #1e3a8a);"
      >
        <div class="absolute -right-4 -top-4 w-40 h-40 rounded-full opacity-10 bg-white" />
        <div class="absolute -right-8 bottom-0 text-white/5 font-black select-none leading-none" style="font-size: 10rem;">3D</div>

        <div class="relative z-10 p-5 md:p-8 md:flex md:items-center md:justify-between">
          <div>
            <p class="text-[10px] font-extrabold text-blue-200 tracking-[0.15em] mb-1">TECHNOLOGIE DE POINTE</p>
            <h2 class="text-xl md:text-3xl font-extrabold text-white leading-tight mb-3">
              Trouvez le style parfait<br class="md:hidden" /> pour votre visage
            </h2>
            <div class="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <UIcon name="i-lucide-scan-face" class="w-3.5 h-3.5 text-white" />
              <span class="text-xs font-semibold text-white">Analyse Morphologique IA</span>
            </div>
          </div>
          <!-- Desktop CTA in hero -->
          <NuxtLink
            to="/try-on"
            class="hidden md:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-2xl mt-0 shadow-lg shadow-orange-500/30 transition-all shrink-0"
          >
            <UIcon name="i-lucide-scan-face" class="w-5 h-5" />
            Scanner mon visage
          </NuxtLink>
        </div>
      </div>

      <!-- Category Filters -->
      <div class="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
        <button
          v-for="cat in categories"
          :key="cat"
          class="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all"
          :class="activeCategory === cat
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Results count (desktop) -->
      <div class="hidden md:flex items-center justify-between mt-5 mb-3">
        <p class="text-sm text-gray-500">
          <span class="font-bold text-gray-900">{{ filteredGlasses.length }}</span>
          monture{{ filteredGlasses.length !== 1 ? 's' : '' }} trouvée{{ filteredGlasses.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Product Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mt-4 pb-28 md:pb-12">
        <NuxtLink
          v-for="item in filteredGlasses"
          :key="item.id"
          :to="`/glasses/${item.id}`"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <div
            class="aspect-square relative flex items-center justify-center"
            :style="`background: linear-gradient(135deg, ${item.bgFrom}, ${item.bgTo})`"
          >
            <UIcon name="i-heroicons-eye" class="w-16 h-16 md:w-20 md:h-20 opacity-20 text-gray-600" />
            <div
              v-if="item.badge"
              class="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold text-white tracking-wider"
              :class="item.badge === 'NOUVEAU' ? 'bg-orange-500' : 'bg-blue-600'"
            >
              {{ item.badge }}
            </div>
          </div>
          <div class="p-2.5 md:p-3">
            <p class="text-xs md:text-sm font-bold text-gray-900 truncate">{{ item.name }}</p>
            <p class="text-[10px] text-gray-400 mb-1.5">{{ item.category }}</p>
            <div class="flex items-center justify-between">
              <span class="text-sm font-extrabold text-blue-700">{{ formatPrice(item.price) }}</span>
              <button
                class="w-6 h-6 md:w-7 md:h-7 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-sm shadow-blue-600/40 transition-colors"
                @click.prevent="addToCart(item)"
              >
                <UIcon name="i-lucide-plus" class="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </NuxtLink>

        <div v-if="filteredGlasses.length === 0" class="col-span-2 md:col-span-3 lg:col-span-4 py-16 text-center">
          <UIcon name="i-lucide-search-x" class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-400">Aucune monture trouvée pour "{{ searchQuery }}"</p>
        </div>
      </div>
    </div>

    <!-- Mobile FAB -->
    <div class="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-30">
      <NuxtLink
        to="/try-on"
        class="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-3.5 rounded-full shadow-xl shadow-orange-500/40 transition-all"
      >
        <UIcon name="i-lucide-scan-face" class="w-4 h-4" />
        Scanner mon visage
      </NuxtLink>
    </div>

  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
