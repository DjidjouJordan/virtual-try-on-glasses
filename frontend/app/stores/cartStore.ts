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
    total: (state) =>
      state.items.reduce((sum, item) =>
        sum + parseFloat(item.monture.prix) * item.quantity, 0),
    count: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
  },

  actions: {
    add(monture: Monture) {
      const existing = this.items.find(i => i.monture.id === monture.id)
      if (existing) existing.quantity++
      else this.items.push({ monture, quantity: 1 })
    },

    remove(montureId: string) {
      this.items = this.items.filter(i => i.monture.id !== montureId)
    },

    clear() {
      this.items = []
    },
  },
})
