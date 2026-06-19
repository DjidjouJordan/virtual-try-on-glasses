import type { PaymentInitiatePayload, PaymentResponse, StatusResponse } from '~/types/payment'

export const usePayment = () => {
  const config = useRuntimeConfig()
  const isProcessing = ref(false)
  const paymentStatus = ref<'idle' | 'pending' | 'success' | 'failed'>('idle')
  const errorMessage = ref<string | null>(null)
  let pollingInterval: NodeJS.Timeout | null = null

  // 1. Initialiser le paiement (Demande Push USSD/OTP)
  const initiatePayment = async (payload: PaymentInitiatePayload): Promise<PaymentResponse | null> => {
    isProcessing.value = true
    paymentStatus.value = 'pending'
    errorMessage.value = null

    try {
      // Remplace par ton URL d'API Laravel (généralement liée via useApi ou proxy)
      const response = await $fetch<PaymentResponse>('/api/payments/initiate', {
        method: 'POST',
        body: payload,
      })

      if (response.status === 'success' && response.campay_reference) {
        // Le push est parti, on commence à surveiller le statut
        startPolling(response.campay_reference)
      }

      return response
    } catch (error: any) {
      paymentStatus.value = 'failed'
      errorMessage.value = error.data?.message || 'Une erreur est survenue lors de la transaction.'
      isProcessing.value = false
      return null
    }
  }

  // 2. Système de Polling (Vérification toutes les 4 secondes)
  const startPolling = (campayReference: string) => {
    if (pollingInterval) clearInterval(pollingInterval)

    let attempts = 0
    const maxAttempts = 20 // 20 * 4s = 80 secondes d'attente max pour le code PIN

    pollingInterval = setInterval(async () => {
      attempts++

      if (attempts > maxAttempts) {
        stopPolling()
        paymentStatus.value = 'failed'
        errorMessage.value = 'Délai d\'attente dépassé. Veuillez réessayer.'
        isProcessing.value = false
        return
      }

      try {
        const data = await $fetch<StatusResponse>(`/api/payments/status/${campayReference}`)

        if (data.payment_status === 'success') {
          stopPolling()
          paymentStatus.value = 'success'
          isProcessing.value = false
          // Optionnel : Vider le panier ici (ex: cartStore.clearCart())
        } else if (data.payment_status === 'failed') {
          stopPolling()
          paymentStatus.value = 'failed'
          errorMessage.value = 'Le paiement a échoué ou a été annulé.'
          isProcessing.value = false
        }
      } catch (error) {
        // En cas d'erreur réseau temporaire, on ne bloque pas, on attend le prochain tour
        console.error('Erreur lors de la vérification du statut', error)
      }
    }, 4000) // Vérification toutes les 4 secondes
  }

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  // Nettoyage automatique si le composant est détruit
  onUnmounted(() => {
    stopPolling()
  })

  return {
    initiatePayment,
    isProcessing,
    paymentStatus,
    errorMessage,
  }
}