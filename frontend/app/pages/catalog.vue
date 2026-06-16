<script setup lang="ts">
import { useMontureStore } from '~/stores/montureStore'
import { useCartStore } from '~/stores/cartStore'

const montureStore = useMontureStore()
const cartStore = useCartStore()

const searchQuery = ref('')
const activeCategory = ref('Tout voir')

const cartCount = computed(() => cartStore.count)

/**
 * ✅ sécurité anti-crash
 */
const safeMontures = computed(() => {
  return Array.isArray(montureStore.montures)
    ? montureStore.montures
    : []
})

/**
 * catégories dynamiques
 */
const categories = computed(() => {
  const cats = safeMontures.value
    .map(m => m.categorie?.trim() || 'Autre')
    .filter(Boolean)

  return ['Tout voir', ...new Set(cats)]
})

/**
 * filtre produits
 */
const filteredGlasses = computed(() => {
  let list = safeMontures.value

  if (activeCategory.value !== 'Tout voir') {
    list = list.filter(
      m => (m.categorie?.trim() || 'Autre') === activeCategory.value
    )
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()

    list = list.filter(m =>
      (m.nom ?? '').toLowerCase().includes(q) ||
      (m.description ?? '').toLowerCase().includes(q) ||
      (m.marque ?? '').toLowerCase().includes(q)
    )
  }

  return list
})

function formatPrice(p: number) {
  return Number(p).toLocaleString('fr-FR') + ' FCFA'
}

function addToCart(item: any) {
  cartStore.add(item)
}

onMounted(() => {
  montureStore.fetchAll()
})

watchEffect(() => {
  console.log('MONTURES:', montureStore.montures)
})
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- ================= TOP BAR ================= -->
    <div class="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3">
      <div class="max-w-7xl mx-auto flex items-center gap-3">

        <!-- Location -->
        <div class="flex items-center gap-1.5 text-xs shrink-0">
          <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 text-blue-600" />
          <button class="font-bold text-gray-800 border-b-2 border-blue-600 pb-0.5">
            DOUALA
          </button>
        </div>

        <!-- Logo mobile -->
        <span class="md:hidden flex-1 text-center text-base font-extrabold text-gray-900">
          DPGlasses
        </span>

        <div class="hidden md:flex flex-1" />

        <!-- Search desktop -->
        <div class="hidden md:flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 w-80">
          <UIcon name="i-lucide-search" class="w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher des montures..."
            class="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        <!-- Icons -->
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/cart"
            class="relative w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full"
          >
            <UIcon name="i-lucide-shopping-bag" class="w-4 h-4" />

            <span
              v-if="cartCount > 0"
              class="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center"
            >
              {{ cartCount }}
            </span>
          </NuxtLink>
        </div>

      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 md:px-8">

      <!-- ================= MOBILE SEARCH ================= -->
      <div class="md:hidden flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-2.5 mt-3">
        <UIcon name="i-lucide-search" class="w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher..."
          class="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <!-- ================= HERO ================= -->
      <div class="mt-4 rounded-3xl overflow-hidden relative bg-gradient-to-br from-blue-600 to-blue-900 p-6 text-white">

        <h2 class="text-xl md:text-3xl font-extrabold">
          Trouvez la monture parfaite
        </h2>

        <p class="text-blue-100 text-sm mt-1">
          Essayage virtuel et catalogue intelligent
        </p>

      </div>

      <!-- ================= CATEGORIES ================= -->
      <div class="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat"
          class="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
          :class="activeCategory === cat
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- ================= LOADING ================= -->
      <div
        v-if="montureStore.loading"
        class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5"
      >
        <div
          v-for="n in 8"
          :key="n"
          class="h-40 bg-gray-100 rounded-2xl animate-pulse"
        />
      </div>

      <!-- ================= PRODUCTS ================= -->
      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pb-24"
      >

        <NuxtLink
          v-for="item in filteredGlasses"
          :key="item.id"
          :to="`/glasses/${item.id}`"
          class="bg-white border rounded-2xl overflow-hidden hover:shadow-md transition"
        >

          <!-- IMAGE -->
          <div class="h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <img
              v-if="item.image?.original"
              :src="item.image.original"
              class="h-full w-full object-cover"
            />
            <UIcon v-else name="i-lucide-glasses" class="w-10 h-10 text-blue-300" />
          </div>

          <!-- INFOS -->
          <div class="p-3">
            <p class="font-bold text-sm truncate">
              {{ item.nom }}
            </p>

            <p class="text-xs text-gray-400 truncate">
              {{ item.marque ?? '—' }}
            </p>

            <div class="flex items-center justify-between mt-2">
              <span class="font-extrabold text-blue-600 text-sm">
                {{ formatPrice(item.prix) }}
              </span>

              <button
                @click.prevent="addToCart(item)"
                class="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center"
              >
                <UIcon name="i-lucide-plus" class="w-4 h-4" />
              </button>
            </div>

          </div>

        </NuxtLink>

        <!-- EMPTY STATE -->
        <div
          v-if="filteredGlasses.length === 0 && !montureStore.loading"
          class="col-span-2 md:col-span-4 text-center py-10 text-gray-400"
        >
          Aucune monture trouvée
        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>