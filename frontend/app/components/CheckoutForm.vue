<script setup lang="ts">
// On imagine que tu as ton store Pinia pour récupérer le panier
const cartStore = {
  items: [
    { monture_id: 1, quantity: 1 } // Exemple de données du panier
  ]
}

const { initiatePayment, isProcessing, paymentStatus, errorMessage } = usePayment()
const phoneNumber = ref('2376') // Pré-remplir avec l'indicateur Cameroun obligatoire pour ton regex

const handleCheckout = async () => {
  const payload = {
    phone_number: phoneNumber.value,
    items: cartStore.items.map(item => ({
      monture_id: item.monture_id,
      quantity: item.quantity
    }))
  }

  await initiatePayment(payload)
}
</script>

<template>
  <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">Paiement Mobile Money / Orange Money</h2>

    <form @submit.prevent="handleCheckout" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Numéro de téléphone (Format : 2376XXXXXXXX)</label>
        <input 
          v-model="phoneNumber" 
          type="text" 
          placeholder="237677123456"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :disabled="isProcessing"
        />
      </div>

      <div v-if="paymentStatus === 'pending'" class="p-3 bg-blue-50 text-blue-700 rounded-md animate-pulse">
        Demande envoyée. Regardez votre téléphone pour saisir votre code PIN...
      </div>

      <div v-if="paymentStatus === 'success'" class="p-3 bg-green-50 text-green-700 rounded-md font-bold">
        Paiement validé avec succès ! Merci pour votre achat.
      </div>

      <div v-if="paymentStatus === 'failed'" class="p-3 bg-red-50 text-red-700 rounded-md">
        Erreur : {{ errorMessage }}
      </div>

      <button 
        type="submit" 
        :disabled="isProcessing || phoneNumber.length < 12"
        class="w-full py-2 px-4 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-600 disabled:opacity-50"
      >
        <span v-if="isProcessing">Traitement en cours...</span>
        <span v-else>Payer avec CamPay</span>
      </button>
    </form>
  </div>
</template>