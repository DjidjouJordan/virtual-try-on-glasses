import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import { useDB } from '~/composables/useDB'

interface Snapshot {
  id: string
  client_id: string
  image_url: string
  date_capture: string
}

export const useSnapshotStore = defineStore('snapshot', {
  state: () => ({
    snapshots: [] as Snapshot[],
  }),

  actions: {
    async fetchAll() {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return
      try {
        const { data, error } = await useFetch<Snapshot[]>('/api/snapshots', {
          baseURL: 'http://localhost:8000',
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        if (error.value) throw error.value
        this.snapshots = data.value ?? []
        if (import.meta.client && this.snapshots.length) {
          const db = useDB()
          await db.snapshots.bulkPut(this.snapshots)
        }
      } catch {
        if (import.meta.client) {
          const db = useDB()
          this.snapshots = await db.snapshots.toArray()
        }
      }
    },

    /** Génère un snapshot depuis le canvas AR (base64) */
    async generate(canvas: HTMLCanvasElement) {
      const auth = useAuthStore()
      const imageBase64 = canvas.toDataURL('image/png')
      const { data, error } = await useFetch('/api/snapshots', {
        method: 'POST',
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${auth.token}` },
        body: { image: imageBase64 },
      })
      if (error.value) throw error.value
      const snap = data.value as Snapshot
      this.snapshots.unshift(snap)
      return snap
    },

    /** Télécharge un snapshot via un lien temporaire */
    download(snapshot: Snapshot) {
      const a = document.createElement('a')
      a.href = snapshot.image_url
      a.download = `snapshot-${snapshot.id}.png`
      a.click()
    },

    async remove(id: string) {
      const auth = useAuthStore()
      await useFetch(`/api/snapshots/${id}`, {
        method: 'DELETE',
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      this.snapshots = this.snapshots.filter(s => s.id !== id)
    },
  },
})
