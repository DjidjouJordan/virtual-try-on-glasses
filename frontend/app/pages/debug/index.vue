<!-- VirtualGlassesPage.vue - Exemple d'intégration complète -->

<template>
  <div class="glasses-container">
    <!-- Vidéo du flux caméra -->
    <video
      ref="videoElement"
      class="video-stream"
      playsinline
      autoplay
      muted
    />

    <!-- Canvas 3D pour le rendu des lunettes -->
    <canvas
      ref="canvasElement"
      class="glasses-canvas"
    />

    <!-- Panneau d'information (debug, optionnel) -->
    <div v-if="showDebugInfo" class="debug-panel">
      <h3>État de la calibration</h3>
      <div class="debug-info">
        <p>
          <strong>État du tracker:</strong>
          {{ trackerLoaded ? '✅ Chargé' : '⏳ Chargement...' }}
        </p>
        <p>
          <strong>État du rendu:</strong>
          {{ isRunning ? '✅ En cours' : '⏸️ Arrêté' }}
        </p>
        <p>
          <strong>Calibration:</strong>
          {{ isCalibrated ? '✅ Auto-calibrée' : '⏳ Calibration...' }}
        </p>
      </div>

      <h3>Paramètres dynamiques</h3>
      <div class="debug-params">
        <p>
          Scale (IPD): <strong>{{ calibration.scale.toFixed(3) }}</strong>
        </p>
        <p>
          Position Y: <strong>{{ calibration.positionY.toFixed(3) }}</strong>
        </p>
        <p>
          Position Z: <strong>{{ calibration.positionZ.toFixed(3) }}</strong>
        </p>
        <p>
          IPD Référence: <strong>{{ calibration.ipdReferenceSize.toFixed(4) }}</strong>
        </p>
      </div>

      <!-- Contrôles de debug -->
      <div class="debug-controls">
        <button @click="toggleDebug">{{ showDebugInfo ? 'Masquer' : 'Afficher' }} Debug</button>
        <button @click="resetCalibration">Réinitialiser calibration</button>
        <button
          v-if="!isRunning"
          @click="startTracking"
          class="btn-primary"
        >
          Démarrer tracking
        </button>
        <button 
          v-if="isRunning" 
          @click="stopTracking"
          class="btn-danger"
        >
          Arrêter tracking
        </button>
      </div>
    </div>

    <!-- Bouton pour afficher/masquer le debug -->
    <button
      class="debug-toggle"
      @click="toggleDebug"
      title="Afficher/Masquer debug"
    >
      🔧
    </button>

    <!-- Message de chargement -->
    <div v-if="!trackerLoaded || !isRunning" class="loading-overlay">
      <div class="spinner"></div>
      <p>{{ trackerLoaded ? 'Initialisation du rendu...' : 'Chargement du détecteur facial...' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useFaceTracker } from '~/composables/useFaceTracker'
import { useGlassesScene } from '~/composables/useGlassesScene'

// ============ COMPOSABLES ============
const { initTracker, detectFace, isLoaded: trackerLoaded } = useFaceTracker()
const {
  initScene,
  renderFrame,
  updatePose,
  updateSize,
  calibration,
  isCalibrated
} = useGlassesScene()

// ============ REFS ============
const videoElement = ref<HTMLVideoElement | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)
const isRunning = ref(false)
const showDebugInfo = ref(false)

let animationFrameId: number | null = null

// ============ LIFECYCLE ============
onMounted(async () => {
  try {
    // Initialiser le tracker MediaPipe
    await initTracker()
    console.log('✅ Tracker MediaPipe initialisé')

    // Initialiser la scène 3D
    if (videoElement.value && canvasElement.value) {
      initScene(canvasElement.value, videoElement.value)
      console.log('✅ Scène 3D initialisée')
    }

    // Demander l'accès à la caméra
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    })

    if (videoElement.value) {
      videoElement.value.srcObject = stream
      videoElement.value.onloadedmetadata = () => {
        videoElement.value?.play()
        isRunning.value = true
        startTracking()
        console.log('✅ Caméra activée, tracking démarré')
      }
    }

    // Gestion du redimensionnement
    window.addEventListener('resize', updateSize)
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
  }
})

onUnmounted(() => {
  stopTracking()
  window.removeEventListener('resize', updateSize)
})

// ============ TRACKING LOOP ============
/**
 * Boucle principale de tracking
 * - Détecte le visage
 * - Calcule la calibration automatique
 * - Met à jour la pose 3D
 * - Rend la scène
 */
const startTracking = () => {
  const track = () => {
    if (!videoElement.value || !isRunning.value) return

    try {
      // Détecter le visage avec MediaPipe
      const results = detectFace(videoElement.value)

      if (
        results &&
        results.facialTransformationMatrixes &&
        results.facialTransformationMatrixes.length > 0
      ) {
        // Extraire la matrice de transformation et les landmarks
        const transformMatrix = results.facialTransformationMatrixes[0]
        const faceLandmarks = results.faceLandmarks[0]

        // 🔑 CRUCIAL: Passer les landmarks pour la calibration automatique!
        updatePose(transformMatrix, faceLandmarks)

        // Debug logs (optionnel)
        if (showDebugInfo.value && results.isTooFar) {
          console.warn('⚠️ Visage trop loin - augmentez la distance')
        }
      }

      // Rendre la scène
      renderFrame()
    } catch (error) {
      console.error('❌ Erreur pendant le tracking:', error)
    }

    // Continuer la boucle
    animationFrameId = requestAnimationFrame(track)
  }

  track()
}

/**
 * Arrête le tracking et libère les ressources
 */
const stopTracking = () => {
  isRunning.value = false
  
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (videoElement.value?.srcObject) {
    const stream = videoElement.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
  }

  console.log('⏹️ Tracking arrêté')
}

/**
 * Réinitialise la calibration (utile pour tester avec différents visages)
 */
const resetCalibration = () => {
  calibration.scale = 1.0
  calibration.positionY = 0
  console.log('🔄 Calibration réinitialisée')
}

/**
 * Toggle du panneau debug
 */
const toggleDebug = () => {
  showDebugInfo.value = !showDebugInfo.value
}
</script>

<style scoped>
.glasses-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

/* Vidéo et Canvas */
.video-stream,
.glasses-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.glasses-canvas {
  z-index: 1;
}

/* Panneau debug */
.debug-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 20px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  max-width: 350px;
  max-height: 60vh;
  overflow-y: auto;
  z-index: 10;
  border: 1px solid #00ff00;
}

.debug-panel h3 {
  margin: 10px 0 5px 0;
  color: #00ff00;
  font-size: 13px;
  text-transform: uppercase;
}

.debug-info,
.debug-params {
  margin-bottom: 15px;
}

.debug-panel p {
  margin: 5px 0;
  line-height: 1.4;
}

.debug-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 15px;
  border-top: 1px solid #00ff00;
  padding-top: 10px;
}

.debug-controls button {
  padding: 8px 12px;
  background: #00ff00;
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 11px;
  transition: all 0.2s;
}

.debug-controls button:hover {
  background: #00cc00;
  transform: scale(1.05);
}

.debug-controls button.btn-primary {
  background: #0066ff;
  color: #fff;
}

.debug-controls button.btn-primary:hover {
  background: #0052cc;
}

.debug-controls button.btn-danger {
  background: #ff3333;
  color: #fff;
}

.debug-controls button.btn-danger:hover {
  background: #cc0000;
}

/* Bouton toggle debug */
.debug-toggle {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0, 255, 0, 0.8);
  border: 2px solid #fff;
  font-size: 24px;
  cursor: pointer;
  z-index: 9;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.debug-toggle:hover {
  background: rgba(0, 255, 0, 1);
  transform: scale(1.1);
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: #fff;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
}

/* Responsive */
@media (max-width: 768px) {
  .debug-panel {
    bottom: 70px;
    left: 10px;
    right: 10px;
    max-width: none;
  }

  .debug-toggle {
    bottom: 10px;
    right: 10px;
  }
}
</style>