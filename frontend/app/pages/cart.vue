<script setup lang="ts">
import { useCartStore } from '~/stores/cartStore'

const cartStore = useCartStore()

const cartItems = computed(() => cartStore.items)
const cartTotal = computed(() => cartStore.total)
const cartCount = computed(() => cartStore.count)

const city = ref('Douala, Cameroun')
const address = ref('')

function formatPrice(prix: number): string {
  return prix.toLocaleString('fr-FR') + ' FCFA'
}

function updateQuantity(montureId: string, delta: number) {
  const item = cartStore.items.find(i => i.monture.id === montureId)
  if (!item) return
  const newQty = item.quantity + delta
  if (newQty <= 0) cartStore.remove(montureId)
  else item.quantity = newQty
}
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- Top Bar -->
    <div class="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3">
      <div class="max-w-7xl mx-auto flex items-center gap-3">
        <NuxtLink to="/catalog" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shrink-0">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 text-gray-700" />
        </NuxtLink>
        <span class="flex-1 md:flex-none text-center md:text-left text-base font-extrabold text-gray-900">Panier</span>
        <div class="md:ml-2 bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
          {{ cartCount }} ARTICLE{{ cartCount !== 1 ? 'S' : '' }}
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">

      <!-- Empty -->
      <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <UIcon name="i-lucide-shopping-bag" class="w-14 h-14 text-gray-200" />
        <p class="text-gray-400 font-medium">Votre panier est vide</p>
        <NuxtLink to="/catalog" class="text-blue-600 font-semibold text-sm">Découvrir le catalogue →</NuxtLink>
      </div>

      <div v-else class="md:grid md:grid-cols-3 md:gap-8">

        <!-- ── LEFT: Cart items + Delivery ── -->
        <div class="md:col-span-2 space-y-4">
          <p class="hidden md:block text-xs font-extrabold text-gray-400 tracking-widest mb-2">VOS ARTICLES</p>

          <div
            v-for="item in cartItems"
            :key="item.monture.id"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm flex gap-3 p-3 md:p-4"
          >
            <div class="w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-100">
              <img v-if="item.monture.image_url" :src="item.monture.image_url" :alt="item.monture.modele" class="w-full h-full object-cover">
              <UIcon v-else name="i-lucide-glasses" class="w-10 h-10 text-blue-300 opacity-50" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-900 text-sm md:text-base truncate">{{ item.monture.modele }}</p>
              <p class="text-xs text-gray-400 mb-2 truncate">{{ item.monture.description ?? '—' }}</p>
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2 bg-gray-50 rounded-full px-1 py-1">
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:bg-gray-100 transition-colors"
                    @click="updateQuantity(item.monture.id, -1)"
                  >
                    <UIcon name="i-lucide-minus" class="w-3 h-3" />
                  </button>
                  <span class="text-sm font-bold text-gray-800 w-5 text-center">{{ item.quantity }}</span>
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:bg-gray-100 transition-colors"
                    @click="updateQuantity(item.monture.id, +1)"
                  >
                    <UIcon name="i-lucide-plus" class="w-3 h-3" />
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-blue-700 text-sm md:text-base">
                    {{ formatPrice(parseFloat(item.monture.prix) * item.quantity) }}
                  </span>
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                    @click="cartStore.remove(item.monture.id)"
                  >
                    <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Delivery -->
          <div class="mt-6">
            <p class="text-xs font-extrabold text-gray-700 tracking-widest mb-3">DÉTAILS DE LIVRAISON</p>
            <div class="space-y-3 bg-gray-50 rounded-2xl p-4">
              <div>
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ville de résidence</label>
                <div class="mt-1 w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 font-medium">
                  {{ city }}
                </div>
              </div>
              <div>
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Adresse ou point de repère</label>
                <input
                  v-model="address"
                  type="text"
                  placeholder="Ex: Akwa, face Palais Dika Akwa"
                  class="mt-1 w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 outline-none focus:border-blue-300"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- ── RIGHT: Summary ── -->
        <div class="md:col-span-1 mt-6 md:mt-0">
          <div class="md:sticky md:top-24 space-y-4">
            <p class="hidden md:block text-xs font-extrabold text-gray-400 tracking-widest mb-2">RÉSUMÉ</p>

            <div class="bg-blue-50 rounded-2xl p-5 space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Sous-total ({{ cartCount }} articles)</span>
                <span class="font-semibold text-gray-800">{{ formatPrice(cartTotal) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Livraison</span>
                <span class="text-green-600 font-semibold">Gratuite</span>
              </div>
              <div class="border-t border-blue-100 pt-3 flex items-center justify-between">
                <span class="font-bold text-gray-900">Total</span>
                <span class="text-2xl font-extrabold text-blue-700">{{ formatPrice(cartTotal) }}</span>
              </div>
            </div>

            <NuxtLink
              to="/checkout"
              class="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-blue-600/30"
            >
              Procéder au paiement
            </NuxtLink>

            <NuxtLink to="/catalog" class="block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Continuer mes achats
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>

    <!-- Mobile spacer -->
    <div class="h-8 md:hidden" />
  </div>
</template>
