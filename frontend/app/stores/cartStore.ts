import { defineStore } from 'pinia'
import type { Monture } from './montureStore'

interface CartItem {
  monture: Monture
  quantity: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    // Calcule le montant total du panier (avec sécurité si le prix est indéfini)
    total: (state) =>
      state.items.reduce((sum, item) => {
        const price = parseFloat(item.monture.prix || '0')
        return sum + price * item.quantity
      }, 0),

    // Calcule le nombre total d'articles dans le panier
    count: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
  },

  actions: {
    /* =========================
       AJOUTER AU PANIER
       ========================= */
    add(monture: Monture) {
      const existing = this.items.find(i => i.monture.id === monture.id)
      if (existing) {
        existing.quantity++
      } else {
        this.items.push({ monture, quantity: 1 })
      }
      this.saveToStorage()
    },

    /* =========================
       DIMINUER LA QUANTITÉ (-)
       ========================= */
    decrement(montureId: string) {
      const existing = this.items.find(i => i.monture.id === montureId)
      if (existing) {
        existing.quantity--
        // Si la quantité tombe à 0, on supprime carrément la monture du panier
        if (existing.quantity <= 0) {
          this.remove(montureId)
        } else {
          this.saveToStorage()
        }
      }
    },

    /* =========================
       SUPPRIMER UN ARTICLE
       ========================= */
    remove(montureId: string) {
      this.items = this.items.filter(i => i.monture.id !== montureId)
      this.saveToStorage()
    },

    /* =========================
       VIDER LE PANIER
       ========================= */
    clear() {
      this.items = []
      this.saveToStorage()
    },

    /* =========================
       PERSISTANCE (LOCALSTORAGE)
       ========================= */
    saveToStorage() {
      if (import.meta.client) {
        localStorage.setItem('cart_items', JSON.stringify(this.items))
      }
    },

    restore() {
      if (!import.meta.client) return
      const raw = localStorage.getItem('cart_items')
      try {
        this.items = raw ? JSON.parse(raw) : []
      } catch (e) {
        console.error('Erreur lors de la restauration du panier:', e)
        this.items = []
      }
    },
  },
})