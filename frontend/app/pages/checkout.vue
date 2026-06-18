<script setup lang="ts">
import { useCartStore } from '~/stores/cartStore'
import { useAuthStore } from '~/stores/authStore'

definePageMeta({ middleware: 'auth' })

const cartStore = useCartStore()
const auth = useAuthStore()

const cartItems = computed(() => cartStore.items)
const cartTotal = computed(() => cartStore.total)

const selectedPayment = ref<'mtn' | 'orange'>('mtn')
const phoneNumber = ref('')
const isConfirming = ref(false)
const payError = ref('')
const payStatus = ref<'idle' | 'pending' | 'success' | 'failed'>('idle')
const commandeId = ref<string | null>(null)

const deliveryFee = computed(() => cartTotal.value >= 100000 ? 0 : 2500)
const totalToPay = computed(() => cartTotal.value + deliveryFee.value)

function formatPrice(prix: number): string {
  return prix.toLocaleString('fr-FR') + ' FCFA'
}

// ── Polling du statut MTN toutes les 3 secondes ──────────────────────────────
let pollInterval: ReturnType<typeof setInterval> | null = null

function startPolling(id: string) {
  pollInterval = setInterval(async () => {
    const { data } = await useFetch<{ statut: string }>(`/api/commandes/${id}/status`, {
      baseURL: 'http://localhost:8000',
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    const statut = data.value?.statut
    if (statut === 'payee') {
      stopPolling()
      payStatus.value = 'success'
      cartStore.clear()
      setTimeout(() => navigateTo('/profile'), 2000)
    } else if (statut === 'echouee' || statut === 'annulee') {
      stopPolling()
      payStatus.value = 'failed'
      payError.value = 'Paiement refusé ou expiré. Réessayez.'
      isConfirming.value = false
    }
  }, 3000)
}

function stopPolling() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
}

async function handlePay() {
  if (!phoneNumber.value || phoneNumber.value.length < 9) return
  payError.value = ''
  isConfirming.value = true
  payStatus.value = 'pending'

  try {
    const { data, error } = await useFetch<{ commande_id: string }>('/api/commandes', {
      method: 'POST',
      baseURL: 'http://localhost:8000',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: {
        methode_paiement: selectedPayment.value,
        telephone: `237${phoneNumber.value}`,
        montant_total: totalToPay.value,
        articles: cartStore.items.map(i => ({ monture_id: i.monture.id, quantity: i.quantity })),
      },
    })
    if (error.value) throw error.value
    commandeId.value = data.value!.commande_id
    startPolling(commandeId.value)
  } catch (e: any) {
    payError.value = e?.data?.message ?? 'Impossible de contacter le service de paiement.'
    payStatus.value = 'failed'
    isConfirming.value = false
  }
}

onUnmounted(() => stopPolling())
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

          <!-- Erreur paiement -->
          <div v-if="payError" class="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
            <UIcon name="i-lucide-circle-alert" class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p class="text-sm text-red-600 font-medium">{{ payError }}</p>
          </div>

          <!-- Succès -->
          <div v-if="payStatus === 'success'" class="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
            <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-bold text-green-800">Paiement confirmé !</p>
              <p class="text-xs text-green-600 mt-1">Votre commande a été enregistrée. Redirection...</p>
            </div>
          </div>

          <!-- En attente MTN -->
          <div v-if="payStatus === 'pending'" class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <UIcon name="i-lucide-loader" class="w-5 h-5 text-amber-500 animate-spin shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-bold text-amber-800">Prompt USSD envoyé sur ton téléphone</p>
              <p class="text-xs text-amber-600 mt-1">
                Accepte la demande de paiement MTN MoMo sur <strong>{{ phoneNumber }}</strong>.<br>
                Si tu ne reçois rien, compose le <strong>*126#</strong>.
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
                :key="item.monture.id"
                class="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5"
              >
                <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-indigo-100 to-blue-100">
                  <img v-if="item.monture.image_url" :src="item.monture.image_url" :alt="item.monture.modele" class="w-full h-full object-cover">
                  <UIcon v-else name="i-lucide-glasses" class="w-5 h-5 text-blue-400 opacity-50" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-gray-800 truncate">{{ item.monture.modele }}</p>
                  <p class="text-[10px] text-gray-400">Qté {{ item.quantity }}</p>
                </div>
                <p class="text-xs font-extrabold text-blue-700 shrink-0">{{ formatPrice(parseFloat(item.monture.prix) * item.quantity) }}</p>
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
