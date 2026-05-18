/**
 * COMPOSABLE : useFaceTracker
 * Rôle : Gère le cycle de vie de MediaPipe Face Landmarker (IA).
 */
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export const useFaceTracker = () => {
  // shallowRef évite que Vue ne surveille l'intérieur de MediaPipe (gain de performance)
  // Contrairement à ref(), il n'observe pas l'intérieur de l'objet (trop lourd pour l'IA).
  const faceLandmarker = shallowRef<FaceLandmarker | null>(null)
  // États réactifs pour l'UI
  const isLoaded = ref(false)
  const lastVideoTime = ref(-1)

  /**
   * Initialise le moteur de détection faciale.
   * Charge les binaires WASM localement pour le mode PWA/Offline.
   */
  const initTracker = async () => {
    // FilesetResolver va chercher les fichiers.wasm dans /public/wasm
    const filesetResolver = await FilesetResolver.forVisionTasks('/wasm')

    faceLandmarker.value = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: '/models/face_landmarker.task',
        delegate: 'GPU' // Force l'utilisation de la puce graphique pour viser les 30 FPS
      },
      outputFaceBlendshapes: true, // Requis pour les expressions faciales futures
      outputFacialTransformationMatrixes: true, // Requis pour coller les lunettes 3D
      runningMode: 'VIDEO',
      numFaces: 1 // Limité à 1 visage pour économiser les ressources mobiles
    })

    isLoaded.value = true
    console.log('IA MediaPipe : Prête')
  }

  /**
   * Analyse une frame vidéo pour détecter les points du visage.
   * @param videoElement L'élément HTML <video> source
   * @returns Les résultats de détection (landmarks, matrices) ou null
   */
  const detectFace = (videoElement: HTMLVideoElement) => {
    // Gardes de sécurité techniques
    if (!faceLandmarker.value) return null

    // Vérifier que la vidéo a des dimensions valides
    if (videoElement.readyState < 2) return null // Vidéo pas encore chargée
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) return null // Dimensions non valides
    // Optimisation : Ne pas traiter la même frame deux fois
    if (videoElement.currentTime === lastVideoTime.value) return null

    lastVideoTime.value = videoElement.currentTime
    // Appel du moteur IA (Inférence locale WASM)
    return faceLandmarker.value.detectForVideo(videoElement, performance.now())
  }

  return { initTracker, detectFace, isLoaded }
}
