/**
 * COMPOSABLE : useFaceTracker
 * Projet : DPGlassess (Virtual Try-On)
 * Rôle : Pilote l'IA MediaPipe Face Landmarker et traite les flux vidéo.
 */
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export const useFaceTracker = () => {
  // shallowRef : Optimisation cruciale. Empêche Vue de rendre réactif l'objet complexe
  // de MediaPipe, ce qui économiserait énormément de CPU sur mobile.
  const faceLandmarker = shallowRef<FaceLandmarker | null>(null)

  const isLoaded = ref(false)
  const lastVideoTime = ref(-1)

  /**
   * Initialise le détecteur avec les fichiers WebAssembly (WASM).
   * Note : Les fichiers doivent être présents dans le dossier /public/wasm/
   */
  const initTracker = async () => {
    // FilesetResolver prépare l'environnement WASM pour l'exécution locale (Offline-ready)
    const filesetResolver = await FilesetResolver.forVisionTasks('/wasm')

    faceLandmarker.value = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: '/models/face_landmarker.task',
        delegate: 'GPU' // Utilise l'accélération matérielle du smartphone
      },
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: true,
      runningMode: 'VIDEO',
      numFaces: 1 // On limite à un seul visage pour maximiser les FPS
    })

    isLoaded.value = true
  }

  /**
   * Analyse une frame vidéo et calcule les métriques de présence.
   * @param videoElement L'élément <video> actif
   */
  const detectFace = (videoElement: HTMLVideoElement) => {
    // Sécurité : Vérification de l'état de la vidéo et du tracker
    if (!faceLandmarker.value || videoElement.readyState < 2) return null
    if (videoElement.currentTime === lastVideoTime.value) return null

    lastVideoTime.value = videoElement.currentTime

    // Exécution de l'inférence IA
    const results = faceLandmarker.value.detectForVideo(videoElement, performance.now())

    // --- LOGIQUE DE DISTANCE (Tâche Wills) ---
    let isTooFar = false
    if (results.faceLandmarks && results.faceLandmarks[0]) {
      // Calcul de la distance entre le coin interne de l'œil gauche (33) et droit (263)
      // Les coordonnées sont normalisées entre 0 et 1.
      const landmarkLeftEye = results.faceLandmarks[0][33]
      const landmarkRightEye = results.faceLandmarks[0][263]

      const eyeDistance = Math.abs(landmarkLeftEye.x - landmarkRightEye.x)

      // Si la distance entre les yeux est < 25% de la largeur de l'image, l'utilisateur est trop loin
      isTooFar = eyeDistance < 0.25
    }

    return {
      ...results,
      isTooFar
    }
  }

  return { initTracker, detectFace, isLoaded }
}
