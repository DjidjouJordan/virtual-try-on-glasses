<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()
const cartStore = useCartStore()
const cartCount = computed(() => cartStore.count)

const isOpen = ref(false)

/* ───────── NAV ───────── */
const navItems = [
  { label: 'Catalogue', shortLabel: 'CATALOG', icon: 'i-lucide-layout-grid', to: '/catalog' },
  { label: 'AR Mirror', shortLabel: 'AR MIRROR', icon: 'i-lucide-scan-face', to: '/debug' },
  { label: 'Profil', shortLabel: 'PROFILE', icon: 'i-lucide-user-round', to: '/profile' }
]

function isActive(item: { to: string }) {
  if (item.to === '/catalog')
    return route.path === '/catalog' || route.path.startsWith('/glasses')

  if (item.to === '/debug')
    return route.path === '/debug'

  if (item.to === '/profile')
    return route.path === '/profile' || route.path === '/cart' || route.path === '/checkout'

  return false
}

/* ───────── CLOSE HELPERS ───────── */
function closeMenu() {
  isOpen.value = false
}

/* ESC KEY */
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu()
  })
})

/* AUTO CLOSE ON ROUTE CHANGE */
watch(() => route.fullPath, () => {
  closeMenu()
})

/* ───────── SWIPE GESTURE (mobile) ───────── */
let startX = 0

function onTouchStart(e: TouchEvent) {
  startX = e.touches[0].clientX
}

function onTouchEnd(e: TouchEvent) {
  const endX = e.changedTouches[0].clientX
  const diff = endX - startX

  // swipe right → open menu
  if (diff > 80 && startX < 50) {
    isOpen.value = true
  }

  // swipe left → close menu
  if (diff < -80) {
    isOpen.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50" @touchstart="onTouchStart" @touchend="onTouchEnd">

    <!-- ───────── MOBILE TOP BAR ───────── -->
    <div class="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-eye" class="w-6 h-6 text-blue-600" />
        <span class="font-extrabold">DPGlasses</span>
      </div>

      <button @click="isOpen = true">
        <UIcon name="i-lucide-menu" class="w-6 h-6" />
      </button>
    </div>

    <!-- ───────── BACKDROP (iOS blur style) ───────── -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        @click="closeMenu"
      />
    </Transition>

    <!-- ───────── DRAWER SLIDE ───────── -->
    <Transition name="slide">
      <div
        v-if="isOpen"
        class="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl"
      >
        <div class="p-5 flex items-center justify-between border-b">
          <p class="font-bold text-lg">Menu</p>

          <button @click="closeMenu">
            <UIcon name="i-lucide-x" class="w-5 h-5" />
          </button>
        </div>

        <nav class="p-3 space-y-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-3 rounded-xl font-medium"
            :class="isActive(item) ? 'bg-blue-50 text-blue-700' : 'text-gray-600'"
            @click="closeMenu"
          >
            <UIcon :name="item.icon" class="w-5 h-5" />
            {{ item.label }}
          </NuxtLink>

          <NuxtLink
            to="/cart"
            class="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600"
            @click="closeMenu"
          >
            <UIcon name="i-lucide-shopping-bag" class="w-5 h-5" />
            Panier
            <span v-if="cartCount" class="ml-auto text-xs bg-orange-500 text-white px-2 rounded-full">
              {{ cartCount }}
            </span>
          </NuxtLink>
        </nav>
      </div>
    </Transition>

    <!-- ───────── DESKTOP SIDEBAR ───────── -->
    <aside class="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r">
      <div class="p-6 font-bold">DPGlasses</div>

      <nav class="flex-1 px-3 space-y-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-3 rounded-xl"
          :class="isActive(item) ? 'bg-blue-50 text-blue-700' : 'text-gray-500'"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          {{ item.label }}
        </NuxtLink>
      </nav>
    </aside>

    <!-- ───────── MAIN ───────── -->
    <div class="md:ml-64 min-h-screen">
      <slot />
    </div>

    <!-- ───────── MOBILE BOTTOM NAV ───────── -->
    <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white border-t z-40">
      <div class="flex">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex-1 flex flex-col items-center py-2"
          :class="isActive(item) ? 'text-blue-700' : 'text-gray-400'"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          <span class="text-[9px]">{{ item.shortLabel }}</span>
        </NuxtLink>
      </div>
    </nav>

  </div>
</template>

<!-- ───────── ANIMATIONS ───────── -->
<style>
/* FADE BACKDROP */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* SLIDE DRAWER */
.slide-enter-active {
  transition: transform 0.3s ease;
}
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>