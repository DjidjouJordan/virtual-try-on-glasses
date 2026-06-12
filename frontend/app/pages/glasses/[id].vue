<script setup lang="ts">
import { useShop } from '~/composables/useShop'

const route = useRoute()
const router = useRouter()
const { getById, addToCart, formatPrice } = useShop()

const glasses = computed(() => getById(Number(route.params.id)))
const activeView = ref<'PROFIL' | 'DETAIL' | 'ÉTUI'>('PROFIL')

function goTryOn() { router.push('/debug') }
function handleAddToCart() {
  if (glasses.value) { addToCart(glasses.value); router.push('/cart') }
}
</script>

<template>
  <div v-if="glasses" class="min-h-screen bg-white">

    <!-- Top Bar -->
    <div class="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3">
      <div class="max-w-7xl mx-auto flex items-center gap-3">
        <NuxtLink to="/catalog" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shrink-0">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 text-gray-700" />
        </NuxtLink>
        <span class="flex-1 md:hidden text-center text-base font-extrabold text-gray-900">DPGlasses</span>
        <span class="hidden md:block text-lg font-extrabold text-gray-900">{{ glasses.name }}</span>
        <div class="flex-1 hidden md:block" />
        <NuxtLink to="/cart" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <UIcon name="i-lucide-shopping-bag" class="w-4 h-4 text-gray-700" />
        </NuxtLink>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
      <div class="md:grid md:grid-cols-2 md:gap-12 lg:gap-16">

        <!-- ── LEFT: Image + View switcher ── -->
        <div class="space-y-4">
          <div
            class="w-full rounded-3xl overflow-hidden relative flex items-center justify-center"
            style="height: 280px; md:height: 400px"
            :style="`background: linear-gradient(135deg, ${glasses.bgFrom}, ${glasses.bgTo})`"
          >
            <div class="absolute -right-6 -top-6 w-40 h-40 rounded-full opacity-10 bg-white" />
            <UIcon name="i-heroicons-eye" class="w-32 h-32 md:w-40 md:h-40 opacity-20 text-gray-600" />
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              <div class="w-5 h-1.5 rounded-full bg-blue-600" />
              <div class="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <div class="w-1.5 h-1.5 rounded-full bg-gray-300" />
            </div>
          </div>

          <!-- View switcher -->
          <div class="flex gap-3">
            <button
              v-for="view in ['PROFIL', 'DETAIL', 'ÉTUI']"
              :key="view"
              class="flex-1 py-2.5 rounded-xl text-[10px] md:text-xs font-extrabold tracking-wider transition-all border"
              :class="activeView === view
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'"
              @click="activeView = (view as any)"
            >
              {{ view }}
            </button>
          </div>
        </div>

        <!-- ── RIGHT: Info ── -->
        <div class="mt-5 md:mt-0 space-y-5">
          <!-- Name + Price -->
          <div>
            <p class="text-[10px] font-extrabold text-blue-500 tracking-[0.2em] mb-1">RECOMMANDATION CLINIQUE</p>
            <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{{ glasses.name }}</h1>
            <p class="text-2xl md:text-3xl font-extrabold text-blue-700 mt-1">{{ formatPrice(glasses.price) }}</p>
          </div>

          <!-- AI Fit Score -->
          <div class="bg-blue-50 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-blue-700 tracking-wider mb-1">INDICE DE FIT AI</p>
              <div class="flex items-baseline gap-1.5">
                <span class="text-4xl font-extrabold text-blue-700">{{ glasses.fitScore }}%</span>
                <span class="text-sm font-semibold text-blue-500">Compatibilité</span>
              </div>
            </div>
            <div class="w-16 h-16 rounded-full border-4 border-blue-600 flex items-center justify-center bg-white shadow-md">
              <UIcon name="i-lucide-scan-face" class="w-7 h-7 text-blue-600" />
            </div>
          </div>

          <!-- Specs -->
          <div>
            <p class="text-xs font-extrabold text-gray-700 tracking-widest mb-3">SPÉCIFICATIONS TECHNIQUES</p>
            <div class="grid grid-cols-2 gap-y-3 gap-x-6">
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Dimensions</p>
                <p class="text-sm font-bold text-gray-800 mt-0.5">{{ glasses.dimensions }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Matériau</p>
                <p class="text-sm font-bold text-blue-600 mt-0.5">{{ glasses.material }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Verres</p>
                <p class="text-sm font-bold text-gray-800 mt-0.5">{{ glasses.lenses }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Poids</p>
                <p class="text-sm font-bold text-gray-800 mt-0.5">{{ glasses.weight }}</p>
              </div>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="space-y-3 pb-24 md:pb-0">
            <button
              class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/30"
              @click="goTryOn"
            >
              <UIcon name="i-lucide-eye" class="w-5 h-5" />
              Essayage Virtuel
            </button>
            <button
              class="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/30"
              @click="handleAddToCart"
            >
              <UIcon name="i-lucide-shopping-cart" class="w-5 h-5" />
              Ajouter au Panier
            </button>
            <div class="flex justify-around pt-1">
              <div class="flex items-center gap-1.5 text-xs text-gray-500">
                <UIcon name="i-lucide-truck" class="w-3.5 h-3.5 text-green-500" />
                <span>Livraison 48h</span>
              </div>
              <div class="flex items-center gap-1.5 text-xs text-gray-500">
                <UIcon name="i-lucide-shield-check" class="w-3.5 h-3.5 text-green-500" />
                <span>Garantie 2 ans</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <div v-else class="flex flex-col items-center justify-center min-h-screen gap-4">
    <p class="text-gray-500">Monture introuvable</p>
    <NuxtLink to="/catalog" class="text-blue-600 font-semibold">← Retour au catalogue</NuxtLink>
  </div>
</template>
