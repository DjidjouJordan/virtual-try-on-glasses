<script setup lang="ts">
/**
 * PAGE DEBUG : Face Tracking
 * Rôle : Valide la boucle de rendu RA (Flux vidéo + IA).
 */
const { initTracker, detectFace, isLoaded } = useFaceTracker()

const video = ref<HTMLVideoElement | null>(null)

/**
 * Initialise le flux caméra et le moteur IA après autorisation.
 */
const startCamera = async () => {
  try {
    // 1. Demande d'accès matériel (Contrainte HTTPS)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: 'user' }
    })

    if (!video.value) return
    video.value.srcObject = stream

    // 2. Attente critique : On attend que la caméra renvoie des pixels réels
    await new Promise<void>((resolve) => {
      if (video.value!.readyState >= 2) resolve()
      else video.value!.addEventListener('loadeddata', () => resolve(), { once: true })
    })

    // 3. Lancement du moteur
    await initTracker()
    // 4. Lancement de la boucle de rendu (Loop)
    requestAnimationFrame(loop)
  } catch (err) {
    console.error('Erreur caméra :', err)
  }
}

/**
 * Boucle infinie de traitement (Render Loop).
 * S'exécute localement sur le terminal utilisateur.
 */
const loop = () => {
  if (video.value && isLoaded.value) {
    const result = detectFace(video.value)

    // Si MediaPipe renvoie des données valides
    if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
      // result.faceLandmarks = Premier visage détecté
      const firstFace = result.faceLandmarks

      // index 0 = premier visage, index [4] = bout du nez ([3] qui est la lèvre)
      const nose = firstFace[0][4]

      if (nose) {
        // Log de debug pour prouver le bon fonctionnement
        console.log('Nez détecté en X:', nose.x.toFixed(2), 'Y:', nose.y.toFixed(2))
      }
    }
  }
  // Demande la frame suivante pour maintenir la fluidité
  requestAnimationFrame(loop)
}
</script>

<template>
  <div class="p-8 flex flex-col items-center gap-4">
    <h1 class="text-2xl font-bold uppercase text-emerald-500">
      MVP IA : Détection Faciale
    </h1>

    <div
      class="relative bg-black rounded-xl overflow-hidden w-full max-w-2xl aspect-video border-2 border-emerald-500/30">
      <video ref="video" autoplay playsinline class="w-full h-full object-cover" />

      <div v-if="!isLoaded && video" class="absolute inset-0 flex items-center justify-center bg-black/60">
        <UIcon name="i-lucide-loader" class="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    </div>

    <UButton size="xl" color="primary" icon="i-lucide-camera" @click="startCamera">
      Démarrer le moteur IA
    </UButton>
  </div>
</template>
