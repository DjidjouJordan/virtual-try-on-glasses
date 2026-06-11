<script setup lang="ts">
const route = useRoute()
const { cartCount } = useShop()

const navItems = [
  { label: 'Catalogue', shortLabel: 'CATALOG', icon: 'i-lucide-layout-grid', to: '/catalog' },
  { label: 'AR Mirror', shortLabel: 'AR MIRROR', icon: 'i-lucide-scan-face', to: '/try-on' },
  { label: 'Profil', shortLabel: 'PROFILE', icon: 'i-lucide-user-round', to: '/profile' },
]

function isActive(item: { to: string }) {
  if (item.to === '/catalog') return route.path === '/catalog' || route.path.startsWith('/glasses')
  if (item.to === '/try-on') return route.path === '/try-on'
  if (item.to === '/profile') {
    return route.path === '/profile' || route.path === '/cart' || route.path === '/checkout'
  }
  return false
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">

    <!-- ── DESKTOP SIDEBAR (md+) ── -->
    <aside class="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex-col z-40">
      <!-- Logo -->
      <div class="px-6 py-6 border-b border-gray-50">
        <NuxtLink to="/catalog" class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/30">
            <UIcon name="i-lucide-eye" class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-base font-extrabold text-gray-900 leading-none">DPGlasses</p>
            <p class="text-[10px] text-gray-400 mt-0.5">L'optique intelligente</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-semibold"
          :class="isActive(item)
            ? 'bg-blue-50 text-blue-700 shadow-sm'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'"
        >
          <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
          {{ item.label }}
          <span
            v-if="item.to === '/profile' && cartCount > 0"
            class="ml-auto text-[10px] font-bold bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
          >{{ cartCount }}</span>
          <div v-else-if="isActive(item)" class="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
        </NuxtLink>

        <!-- Cart link in sidebar -->
        <NuxtLink
          to="/cart"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-semibold"
          :class="route.path === '/cart' || route.path === '/checkout'
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'"
        >
          <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 shrink-0" />
          Panier
          <span
            v-if="cartCount > 0"
            class="ml-auto text-[10px] font-bold bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
          >{{ cartCount }}</span>
        </NuxtLink>
      </nav>

      <!-- User -->
      <div class="p-4 border-t border-gray-50">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-user-round" class="w-4 h-4 text-blue-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-gray-700">Invité</p>
            <NuxtLink to="/profile" class="text-[10px] text-blue-500 font-medium">Se connecter →</NuxtLink>
          </div>
        </div>
      </div>
    </aside>

    <!-- ── MAIN CONTENT ── -->
    <div class="md:ml-64 min-h-screen">
      <slot />
    </div>

    <!-- ── MOBILE BOTTOM NAV ── -->
    <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40">
      <div class="flex">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors"
          :class="isActive(item) ? 'text-blue-700' : 'text-gray-400'"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          <span class="text-[9px] font-bold tracking-wider">{{ item.shortLabel }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
