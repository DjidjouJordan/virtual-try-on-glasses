<script setup lang="ts">
import { useShop } from '~/composables/useShop'

const { cartItems, cartTotal, cartCount, formatPrice } = useShop()
const router = useRouter()

const selectedPayment = ref<'momo' | 'orange'>('momo')
const phoneNumber = ref('')
const isConfirming = ref(false)

const deliveryFee = computed(() => cartTotal.value >= 100000 ? 0 : 2500)
const totalToPay = computed(() => cartTotal.value + deliveryFee.value)

async function handlePay() {
  if (!phoneNumber.value || phoneNumber.value.length < 9) return
  isConfirming.value = true
  await new Promise(r => setTimeout(r, 2500))
  router.push('/catalog')
}
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- Top Bar -->
    <div class="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3">
      <div class="max-w-7xl mx-auto flex items-center gap-3">
        <NuxtLink to="/cart" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 text-gray-700" />
        </NuxtLink>
        <span class="text-base font-extrabold text-gray-900">Paiement</span>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
      <div class="md:grid md:grid-cols-3 md:gap-8">

        <!-- ── LEFT: Payment form ── -->
        <div class="md:col-span-2 space-y-6">

          <!-- Payment Method -->
          <div>
            <p class="text-xs font-extrabold text-gray-700 tracking-widest mb-3">MÉTHODE DE PAIEMENT</p>
            <div class="grid grid-cols-2 gap-3">
              <button
                class="relative border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all"
                :class="selectedPayment === 'momo' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'"
                @click="selectedPayment = 'momo'"
              >
                <div class="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center">
                  <span class="text-xs font-extrabold text-yellow-900 text-center leading-tight">MTN<br/>MoMo</span>
                </div>
                <span class="text-sm font-bold text-gray-700">MTN MoMo</span>
                <div
                  v-if="selectedPayment === 'momo'"
                  class="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"
                >
                  <UIcon name="i-lucide-check" class="w-3 h-3 text-white" />
                </div>
              </button>

              <button
                class="relative border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all"
                :class="selectedPayment === 'orange' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'"
                @click="selectedPayment = 'orange'"
              >
                <div class="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                  <span class="text-xs font-extrabold text-white">Orange</span>
                </div>
                <span class="text-sm font-bold text-gray-700">Orange Money</span>
                <div
                  v-if="selectedPayment === 'orange'"
                  class="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                >
                  <UIcon name="i-lucide-check" class="w-3 h-3 text-white" />
                </div>
              </button>
            </div>
          </div>

          <!-- Phone -->
          <div>
            <label class="text-xs font-extrabold text-gray-700 tracking-widest">NUMÉRO DE TÉLÉPHONE</label>
            <div class="mt-2 flex items-center gap-2 border-2 rounded-xl px-3 py-3 bg-gray-50 transition-colors"
              :class="phoneNumber.length >= 9 ? 'border-blue-400' : 'border-gray-200 focus-within:border-blue-300'"
            >
              <span class="text-sm font-bold text-gray-500">+237</span>
              <div class="w-px h-5 bg-gray-200" />
              <input
                v-model="phoneNumber"
                type="tel"
                placeholder="6XX XXX XXX"
                class="flex-1 bg-transparent text-sm text-gray-800 outline-none font-medium tracking-widest"
                maxlength="9"
              />
              <UIcon
                v-if="phoneNumber.length >= 9"
                name="i-lucide-check-circle"
                class="w-4 h-4 text-green-500 shrink-0"
              />
            </div>
          </div>

          <!-- Confirmation status -->
          <div v-if="isConfirming" class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <UIcon name="i-lucide-loader" class="w-5 h-5 text-amber-500 animate-spin shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-bold text-amber-800">En attente de confirmation...</p>
              <p class="text-xs text-amber-600 mt-1">
                Veuillez composer le <strong>#126#</strong> ou consulter l'application MoMo si vous ne recevez pas le prompt USSD.
              </p>
            </div>
          </div>

          <!-- Mobile pay button -->
          <div class="md:hidden pb-24">
            <button
              class="w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg text-base"
              :class="isConfirming || !phoneNumber || phoneNumber.length < 9
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'"
              :disabled="isConfirming || !phoneNumber || phoneNumber.length < 9"
              @click="handlePay"
            >
              <UIcon name="i-lucide-lock" class="w-5 h-5" />
              Payer en toute sécurité
            </button>
          </div>
        </div>

        <!-- ── RIGHT: Order Summary ── -->
        <div class="md:col-span-1 mt-6 md:mt-0">
          <div class="md:sticky md:top-24 space-y-4">
            <p class="text-xs font-extrabold text-gray-700 tracking-widest">RÉSUMÉ DE COMMANDE</p>

            <!-- Items -->
            <div class="space-y-2">
              <div
                v-for="item in cartItems"
                :key="item.glasses.id"
                class="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5"
              >
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  :style="`background: linear-gradient(135deg, ${item.glasses.bgFrom}, ${item.glasses.bgTo})`"
                >
                  <UIcon name="i-heroicons-eye" class="w-5 h-5 opacity-25 text-gray-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-gray-800 truncate">{{ item.glasses.name }}</p>
                  <p class="text-[10px] text-gray-400">{{ item.glasses.category }} · Qté {{ item.quantity }}</p>
                </div>
                <p class="text-xs font-extrabold text-blue-700 shrink-0">{{ formatPrice(item.glasses.price) }}</p>
              </div>
            </div>

            <!-- Totals -->
            <div class="bg-gray-50 rounded-2xl p-4 space-y-2.5">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Sous-total</span>
                <span class="font-semibold">{{ formatPrice(cartTotal) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Livraison Express</span>
                <span :class="deliveryFee === 0 ? 'text-green-600 font-semibold' : 'font-semibold'">
                  {{ deliveryFee === 0 ? 'Gratuite' : formatPrice(deliveryFee) }}
                </span>
              </div>
              <div class="border-t border-gray-200 pt-2.5 flex justify-between">
                <span class="font-bold text-gray-900">Total à payer</span>
                <span class="text-xl font-extrabold text-blue-700">{{ formatPrice(totalToPay) }}</span>
              </div>
            </div>

            <!-- Desktop pay button -->
            <button
              class="hidden md:flex w-full font-bold py-4 rounded-2xl items-center justify-center gap-2 transition-all shadow-lg text-base"
              :class="isConfirming || !phoneNumber || phoneNumber.length < 9
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'"
              :disabled="isConfirming || !phoneNumber || phoneNumber.length < 9"
              @click="handlePay"
            >
              <UIcon v-if="isConfirming" name="i-lucide-loader" class="w-5 h-5 animate-spin" />
              <UIcon v-else name="i-lucide-lock" class="w-5 h-5" />
              {{ isConfirming ? 'En attente...' : `Payer ${formatPrice(totalToPay)}` }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
