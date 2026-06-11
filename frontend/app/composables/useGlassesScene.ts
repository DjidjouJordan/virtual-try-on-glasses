/**
 * COMPOSABLE : useGlassesScene (OPTIMISÉ ET ALIGNÉ CORRECTIONS)
 * Projet : DPGlassess
 * Rôle : Gestion 3D avec alignement strict des unités et décalages locaux
 */
import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { ref, shallowRef, reactive } from 'vue'

export const useGlassesScene = () => {
  const scene = new THREE.Scene()
  let renderer: THREE.WebGLRenderer | null = null
  let camera: THREE.PerspectiveCamera | null = null

  const glassesContainer = new THREE.Group()
  const glassesModel = shallowRef<THREE.Object3D | null>(null)
  const faceOccluder = shallowRef<THREE.Object3D | null>(null)

  // 🛠️ CENTRE DE CONTRÔLE DE LA CALIBRATION (Modifiable en temps réel)
  const calibration = reactive({
    scale: 1.08,
    positionX: 0.0,    // Décalage Gauche/Droite (en cm)
    positionY: -0.2,   // Décalage Haut/Bas (en cm) - Descendre si sur le front
    positionZ: 0.5,    // Décalage Avant/Arrière (en cm) - Avancer pour sortir de l'occluder
    rotationX: 0.0,    // Ajustement fin inclinaison (en radians, ex: Math.PI / 12)
    rotationY: 0.0,    // Ajustement fin rotation gauche/droite
    rotationZ: 0.0     // Ajustement fin balancement
  })

  const isCalibrated = ref(false)

  // Variables persistantes pour éviter de surcharger le Garbage Collector à 60 FPS
  const tempMatrix = new THREE.Matrix4()
  const targetPos = new THREE.Vector3()
  const targetQuat = new THREE.Quaternion()
  const targetScale = new THREE.Vector3()

  const initScene = (canvasElement: HTMLCanvasElement, _videoElement: HTMLVideoElement) => {
    const width = window.innerWidth
    const height = window.innerHeight

    renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x000000, 0)

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 0) // La caméra regarde vers Z-

    scene.add(new THREE.AmbientLight(0xffffff, 2.5))
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5)
    dirLight.position.set(0, 50, 50)
    scene.add(dirLight)

    scene.add(glassesContainer)
    loadFaceOccluder()
    loadGlasses()
  }

  const updateSize = () => {
    if (!renderer || !camera) return
    const width = window.innerWidth
    const height = window.innerHeight
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const loadFaceOccluder = () => {
    const loader = new OBJLoader()
    loader.load(
      '/models/canonical_face_model.obj',
      (obj: any) => {
        const box = new THREE.Box3().setFromObject(obj)
        const center = box.getCenter(new THREE.Vector3())
        obj.position.sub(center) // Centrage de l'occluder

        const mat = new THREE.MeshBasicMaterial({ depthWrite: true, colorWrite: false })
        obj.traverse((child: any) => {
          if (child instanceof THREE.Mesh) child.material = mat
        })
        
        obj.scale.set(1, 1, 1)
        faceOccluder.value = obj
        scene.add(obj)
      }
    )
  }

  const loadGlasses = () => {
    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    loader.setDRACOLoader(dracoLoader)

    loader.load(
      '/models/glasses_model.glb',
      (gltf: any) => {
        const model = gltf.scene

        model.traverse((child: any) => {
          if (child instanceof THREE.Mesh && child.material) {
            child.material.precision = 'mediump'
          }
        })

        // 1. Centrage initial du modèle GLB sur son propre pont de nez
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)

        // 2. CORRECTION NATIVE BLENDER (Axe Y de Blender vers Axe Z de Three.js)
        // D'après tes captures Blender, la lunette regarde vers le haut ou le côté. 
        // On applique une rotation de base fixe pour l'aligner face à la caméra.
        model.rotation.set(0, Math.PI, 0) 

        const pivot = new THREE.Group()
        pivot.add(model)

        glassesModel.value = pivot
        glassesContainer.add(pivot)
        dracoLoader.dispose()
      }
    )
  }

  /**
   * Reçoit la matrice MediaPipe et applique les transformations locales de calibration
   */
  const updatePose = (matrixObj: any, faceLandmarks?: any[]) => {
    if (!matrixObj || !glassesContainer) return

    if (faceLandmarks && faceLandmarks.length > 0) {
      isCalibrated.value = true
    }

    const matrixArray = matrixObj?.data ?? matrixObj
    if (!matrixArray || (!Array.isArray(matrixArray) && !(matrixArray instanceof Float32Array))) return

    // 1. Décomposition de la matrice de tracking (Espace Monde)
    tempMatrix.fromArray(matrixArray)
    tempMatrix.decompose(targetPos, targetQuat, targetScale)

    // Positionnement brut du conteneur sur le visage
    glassesContainer.position.copy(targetPos)
    glassesContainer.quaternion.copy(targetQuat)

    // 2. Application de la calibration en ESPACE LOCAL (Reste stable même si la tête tourne)
    if (glassesModel.value) {
      // Échelle
      glassesModel.value.scale.setScalar(calibration.scale)
      
      // Position locale (X, Y, Z relatifs à l'orientation du visage)
      glassesModel.value.position.set(
        calibration.positionX,
        calibration.positionY,
        calibration.positionZ
      )
      
      // Rotation locale corrective
      glassesModel.value.rotation.set(
        calibration.rotationX,
        calibration.rotationY,
        calibration.rotationZ
      )
    }

    // 3. Synchronisation parfaite de l'occluder sur la position du visage
    if (faceOccluder.value) {
      faceOccluder.value.position.copy(targetPos)
      faceOccluder.value.quaternion.copy(targetQuat)
    }
  }

  const renderFrame = () => {
    if (renderer && camera) renderer.render(scene, camera)
  }

  return {
    initScene,
    renderFrame,
    updatePose,
    updateSize,
    glassesModel,
    calibration,
    isCalibrated
  }
}