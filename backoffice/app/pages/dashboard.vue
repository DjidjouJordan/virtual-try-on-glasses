<script setup lang="ts">
import { useStatsStore } from '~/stores/statsStore'

definePageMeta({ middleware: 'auth' })

const stats = useStatsStore()
await stats.fetchStats()

const cards = computed(() => [
  { label: 'Utilisateurs', value: stats.stats?.total_users ?? 0, icon: 'i-lucide-users', color: 'blue' as const },
  { label: 'Clients', value: stats.stats?.total_clients ?? 0, icon: 'i-lucide-user-check', color: 'emerald' as const },
  { label: 'Montures', value: stats.stats?.total_montures ?? 0, icon: 'i-lucide-glasses', color: 'violet' as const },
  { label: 'Snapshots', value: stats.stats?.total_snapshots ?? 0, icon: 'i-lucide-camera', color: 'orange' as const }
])
</script>

<template>
  <div>
    <PageHeader title="Dashboard" description="Vue d'ensemble de votre catalogue et de vos utilisateurs." />

    <!-- Stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      <StatCard
        v-for="card in cards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :icon="card.icon"
        :color="card.color"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Dernières montures -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p class="font-bold text-slate-800">Dernières montures</p>
          <NuxtLink to="/montures" class="text-xs text-blue-600 font-semibold hover:underline">
            Voir tout
          </NuxtLink>
        </div>
        <div class="divide-y divide-slate-50">
          <div
            v-for="m in stats.stats?.recent_montures ?? []"
            :key="m.id"
            class="flex items-center gap-3 px-5 py-3"
          >
            <img
              v-if="m.image_url"
              :src="m.image_url"
              :alt="m.nom"
              class="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
            >
            <div v-else class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-glasses" class="w-5 h-5 text-slate-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800 truncate">{{ m.nom }}</p>
              <p class="text-xs text-slate-400">{{ m.marque ?? '—' }} · {{ m.categorie ?? '—' }}</p>
            </div>
            <span
              class="text-xs font-bold px-2 py-0.5 rounded-full"
              :class="m.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'"
            >
              {{ m.is_active ? 'Actif' : 'Inactif' }}
            </span>
          </div>
          <EmptyState
            v-if="!stats.stats?.recent_montures?.length"
            icon="i-lucide-glasses"
            title="Aucune monture"
            description="Aucune monture créée pour le moment."
          />
        </div>
      </div>

      <!-- Derniers snapshots -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p class="font-bold text-slate-800">Derniers snapshots</p>
          <NuxtLink to="/snapshots" class="text-xs text-blue-600 font-semibold hover:underline">
            Voir tout
          </NuxtLink>
        </div>
        <div class="divide-y divide-slate-50">
          <div
            v-for="s in stats.stats?.recent_snapshots ?? []"
            :key="s.id"
            class="flex items-center gap-3 px-5 py-3"
          >
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                v-if="s.media?.[0]?.url"
                :src="s.media[0].url"
                alt="snapshot"
                class="w-full h-full object-cover"
              >
              <UIcon v-else name="i-lucide-camera" class="w-5 h-5 text-slate-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800">Snapshot</p>
              <p class="text-xs text-slate-400">{{ new Date(s.created_at).toLocaleDateString('fr-FR') }}</p>
            </div>
          </div>
          <EmptyState
            v-if="!stats.stats?.recent_snapshots?.length"
            icon="i-lucide-camera"
            title="Aucun snapshot"
            description="Aucun snapshot enregistré pour le moment."
          />
        </div>
      </div>

    </div>
  </div>
</template>
