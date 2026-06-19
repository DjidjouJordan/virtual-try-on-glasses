<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

const auth = useAuthStore()
const route = useRoute()

const navItems = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
  { label: 'Montures', icon: 'i-lucide-glasses', to: '/montures' },
  { label: 'Catégories', icon: 'i-lucide-tag', to: '/categories' },
  { label: 'Modèles 3D', icon: 'i-lucide-box', to: '/modeles3d' },
  { label: 'Snapshots', icon: 'i-lucide-camera', to: '/snapshots' },
  { label: 'Utilisateurs', icon: 'i-lucide-users', to: '/utilisateurs' }
]

function isActive(to: string) {
  if (to === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(to)
}

async function handleLogout() {
  await auth.logout()
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">

    <!-- ── Sidebar ── -->
    <aside class="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-30">

      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div class="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow shadow-blue-600/30">
          <UIcon name="i-lucide-eye" class="w-4 h-4 text-white" />
        </div>
        <div>
          <p class="font-extrabold text-slate-900 text-sm leading-tight">DPGlasses</p>
          <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Backoffice</p>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
          :class="isActive(item.to)
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'"
        >
          <UIcon :name="item.icon" class="w-4 h-4 shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- User footer -->
      <div class="px-4 py-4 border-t border-slate-100">
        <div class="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div class="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-user" class="w-4 h-4 text-slate-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-slate-800 truncate">{{ auth.user?.nom ?? 'Admin' }}</p>
            <p class="text-[10px] text-slate-400 truncate">{{ auth.user?.email }}</p>
          </div>
          <button
            class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Se déconnecter"
            @click="handleLogout"
          >
            <UIcon name="i-lucide-log-out" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- ── Main ── -->
    <div class="flex-1 md:ml-64 flex flex-col min-h-screen">

      <!-- Mobile top bar -->
      <header class="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-eye" class="w-4 h-4 text-white" />
          </div>
          <span class="font-extrabold text-slate-900 text-sm">DPGlasses BO</span>
        </div>
        <button @click="handleLogout">
          <UIcon name="i-lucide-log-out" class="w-5 h-5 text-slate-500" />
        </button>
      </header>

      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
