// stores/snapshotStore.ts
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import { useDB } from '~/composables/useDB'

export interface SnapshotImage {
  id: number
  snapshot_id?: string
  image_url: string
  thumb_url: string
  preview_url: string
  date_capture: string
  created_at: string
}

interface MediaItem {
  id: number
  original_url?: string
  url?: string
  thumb?: string
  preview?: string
  name?: string
  created_at: string
}

interface SnapshotApi {
  id: string
  client_id: string
  date_capture: string
  media: MediaItem[]
}

interface CreateSnapshotResponse {
  message: string
  media_id: number
  url: string
  thumb: string
  preview: string
}

export const useSnapshotStore = defineStore('snapshot', {
  state: () => ({
    images: [] as SnapshotImage[]
  }),

  getters: {
    snapshots: state => state.images
  },

  actions: {
    /* =========================
       RECUPERER TOUS LES SNAPSHOTS
       ========================= */
    async fetchAll(): Promise<void> {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return

      const { public: { apiBase } } = useRuntimeConfig()
      try {
        const data = await $fetch<SnapshotApi[]>(`${apiBase}/snapshots`, {
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            Accept: 'application/json'
          }
        })

        const medias: SnapshotImage[] = []

        if (Array.isArray(data)) {
          data.forEach(snapshot => {
            if (snapshot.media && Array.isArray(snapshot.media)) {
              snapshot.media.forEach(media => {
                medias.push({
                  id: media.id,
                  snapshot_id: snapshot.id,
                  image_url: media.original_url || media.url || '',
                  thumb_url: media.thumb || media.original_url || media.url || '',
                  preview_url: media.preview || media.original_url || media.url || '',
                  date_capture: snapshot.date_capture,
                  created_at: media.created_at
                })
              })
            }
          })
        }

        this.images = medias

        // Synchronisation locale avec Dexie DB
        if (import.meta.client) {
          const db = useDB()
          await db.snapshots.clear()
          await db.snapshots.bulkPut(JSON.parse(JSON.stringify(medias)))
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des snapshots:', error)
        
        // Mode hors-ligne / Fallback sur Dexie DB
        if (import.meta.client) {
          const db = useDB()
          this.images = await db.snapshots.toArray()
        }
      }
    },

    /* =========================
       GENERER UN NOUVEAU SNAPSHOT (AR)
       ========================= */
    async generate(canvas: HTMLCanvasElement): Promise<SnapshotImage> {
      const auth = useAuthStore()
      const { public: { apiBase } } = useRuntimeConfig()

      // Extraction immédiate du Base64 pour figer la frame AR de l'utilisateur
      const imageBase64 = canvas.toDataURL('image/png')

      try {
        const data = await $fetch<CreateSnapshotResponse>(`${apiBase}/snapshots`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            Accept: 'application/json'
          },
          body: { image: imageBase64 }
        })

        const image: SnapshotImage = {
          id: data.media_id,
          image_url: data.url,
          thumb_url: data.thumb,
          preview_url: data.preview ?? data.url,
          date_capture: new Date().toISOString(),
          created_at: new Date().toISOString()
        }

        // Ajout au début du tableau local (Tri décroissant pour l'affichage)
        this.images.unshift(image)

        // Sauvegarde locale dans Dexie DB
        if (import.meta.client) {
          const db = useDB()
          await db.snapshots.put(JSON.parse(JSON.stringify(image)))
        }

        return image
      } catch (error) {
        console.error('Erreur lors de la génération du snapshot:', error)
        throw error
      }
    },

    /* =========================
       TELECHARGER L'IMAGE EN LOCAL
       ========================= */
    download(image: SnapshotImage): void {
      if (!import.meta.client) return
      
      const url = image.image_url
      if (!url) return

      const a = document.createElement('a')
      a.href = url
      a.download = `snapshot-${image.id}.png`
      a.target = '_blank'
      a.click()
    },

    /* =========================
       SUPPRIMER UN SNAPSHOT
       ========================= */
    async remove(mediaId: number): Promise<void> {
      const auth = useAuthStore()
      const { public: { apiBase } } = useRuntimeConfig()

      try {
        await $fetch(`${apiBase}/snapshots/media/${mediaId}`, {
          method: 'DELETE',
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            Accept: 'application/json'
          }
        })

        // Filtrage de l'état réactif local
        this.images = this.images.filter(img => img.id !== mediaId)

        // Suppression de l'élément dans Dexie DB
        if (import.meta.client) {
          const db = useDB()
          await db.snapshots.delete(mediaId)
        }
      } catch (error) {
        console.error(`Erreur lors de la suppression du media ${mediaId}:`, error)
        throw error
      }
    }
  }
})