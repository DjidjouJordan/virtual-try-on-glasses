import Dexie, { type Table } from 'dexie'
import type { Monture } from '~/stores/montureStore'

interface FavoriCached {
  id: string
  client_id: string
  monture_id: string
  date_ajout: string
  monture: Monture
}

interface SnapshotCached {
  id: string
  client_id: string
  image_url: string
  date_capture: string
}

class DPGlassesDB extends Dexie {
  montures!: Table<Monture>
  favoris!: Table<FavoriCached>
  snapshots!: Table<SnapshotCached>

  constructor() {
    super('dpglasses_v1')
    this.version(1).stores({
      montures: 'id, modele',
      favoris: 'id, monture_id, client_id',
      snapshots: 'id, client_id, date_capture',
    })
  }
}

let _db: DPGlassesDB | null = null

export function useDB(): DPGlassesDB {
  if (!_db) _db = new DPGlassesDB()
  return _db
}
