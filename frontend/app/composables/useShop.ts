export interface Glasses {
  id: number
  name: string
  category: string
  price: number
  badge: 'NOUVEAU' | 'TOP VENTE' | null
  material: string
  weight: string
  dimensions: string
  lenses: string
  fitScore: number
  modelFile: string
  bgFrom: string
  bgTo: string
}

export interface CartItem {
  glasses: Glasses
  quantity: number
}

export const mockGlasses: Glasses[] = [
  {
    id: 1,
    name: 'Titanium Edge Pro',
    category: 'Montures Carrées',
    price: 45000,
    badge: 'NOUVEAU',
    material: 'Titane de Grade Médical',
    weight: '12.5 Grammes',
    dimensions: '54 ø 18 - 140mm',
    lenses: 'Anti-lumière bleue incl.',
    fitScore: 94,
    modelFile: '/models/glasses_model.glb',
    bgFrom: '#e0e7ff',
    bgTo: '#c7d2fe',
  },
  {
    id: 2,
    name: 'Classic Havana',
    category: 'Ovale',
    price: 32500,
    badge: 'TOP VENTE',
    material: 'Acétate Premium',
    weight: '18.2 Grammes',
    dimensions: '52 ø 20 - 145mm',
    lenses: 'Antireflet UV400',
    fitScore: 87,
    modelFile: '/models/glasses_model1.glb',
    bgFrom: '#fef3c7',
    bgTo: '#fde68a',
  },
  {
    id: 3,
    name: 'Optical Gold Lite',
    category: 'Montures Carrées',
    price: 65000,
    badge: null,
    material: 'Monture Or 18K',
    weight: '16.0 Grammes',
    dimensions: '55 ø 17 - 143mm',
    lenses: 'Photochromique',
    fitScore: 91,
    modelFile: '/models/glasses_model.glb',
    bgFrom: '#fef9c3',
    bgTo: '#fef08a',
  },
  {
    id: 4,
    name: 'Crystal Clear',
    category: 'Classique',
    price: 28000,
    badge: 'NOUVEAU',
    material: 'Acétate Transparent',
    weight: '14.5 Grammes',
    dimensions: '50 ø 19 - 140mm',
    lenses: 'Neutre',
    fitScore: 89,
    modelFile: '/models/glasses_model1.glb',
    bgFrom: '#ecfdf5',
    bgTo: '#d1fae5',
  },
  {
    id: 5,
    name: 'Aviator Tech-Precision',
    category: 'Oversized',
    price: 245000,
    badge: null,
    material: 'Titane de Grade Médical',
    weight: '14.5 Grammes',
    dimensions: '54 ø 18 - 145mm',
    lenses: 'Anti-lumière bleue incl.',
    fitScore: 98,
    modelFile: '/models/glasses_model.glb',
    bgFrom: '#ede9fe',
    bgTo: '#ddd6fe',
  },
  {
    id: 6,
    name: 'Aero Classic',
    category: 'Classique',
    price: 35000,
    badge: null,
    material: 'Aluminium Aérospatial',
    weight: '11.0 Grammes',
    dimensions: '53 ø 18 - 142mm',
    lenses: 'Anti-lumière bleue incl.',
    fitScore: 85,
    modelFile: '/models/glasses_model1.glb',
    bgFrom: '#fce7f3',
    bgTo: '#fbcfe8',
  },
]

export const categories = ['Tout voir', 'Montures Carrées', 'Ovale', 'Oversized', 'Classique']

// Reactive cart state (singleton-like via module scope)
const cartItems = ref<CartItem[]>([])

export function useShop() {
  const cartCount = computed(() => cartItems.value.reduce((n, item) => n + item.quantity, 0))
  const cartTotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.glasses.price * item.quantity, 0))

  function addToCart(glasses: Glasses) {
    const existing = cartItems.value.find(item => item.glasses.id === glasses.id)
    if (existing) {
      existing.quantity++
    } else {
      cartItems.value.push({ glasses, quantity: 1 })
    }
  }

  function removeFromCart(id: number) {
    cartItems.value = cartItems.value.filter(item => item.glasses.id !== id)
  }

  function updateQuantity(id: number, delta: number) {
    const item = cartItems.value.find(i => i.glasses.id === id)
    if (!item) return
    item.quantity = Math.max(1, item.quantity + delta)
  }

  function getById(id: number): Glasses | undefined {
    return mockGlasses.find(g => g.id === id)
  }

  function formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' FCFA'
  }

  return { cartItems, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, getById, formatPrice }
}
