import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { reactive, shallowRef } from 'vue'

export const useGlassesScene = () => {
  const scene = new THREE.Scene()

  let renderer: THREE.WebGLRenderer | null = null
  let camera: THREE.PerspectiveCamera | null = null

  const glassesContainer = new THREE.Group()
  const glassesModel = shallowRef<THREE.Group | null>(null)
  const faceOccluder = shallowRef<THREE.Object3D | null>(null)

  /**
   * Réglages fins
   * - calibration.scale : ajuste manuellement la taille globale
   * - position/rotation : petits offsets de calibration
   */
  const calibration = reactive({
    scale: 1.0,
    positionX: 0.0,
    positionY: 0.0,
    positionZ: 0.0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  })

  /**
   * Taille de base des lunettes après normalisation
   * Si le modèle reste trop grand, baisse légèrement cette valeur
   * (ex: 0.10 à 0.12)
   */
  const TARGET_GLASSES_WIDTH = 0.016

  /**
   * Réglages dynamiques selon la distance du visage
   */
  const REFERENCE_DEPTH = 0.55
  const DYNAMIC_SCALE_MIN = 0.4
  const DYNAMIC_SCALE_MAX = 1.6
  const DYNAMIC_SCALE_LERP = 0.08

  let smoothedDynamicScale = 1
  const smoothedPos = new THREE.Vector3()
  const smoothedQuat = new THREE.Quaternion()

  const initScene = (canvas: HTMLCanvasElement) => {
    const width = window.innerWidth
    const height = window.innerHeight

    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    })

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    /**
     * FOV un peu large pour mieux coller à l’effet caméra mobile
     */
    camera = new THREE.PerspectiveCamera(63, width / height, 0.01, 100)
    camera.position.set(0, 0, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 2.2))

    const light = new THREE.DirectionalLight(0xffffff, 1.2)
    light.position.set(0, 2, 5)
    scene.add(light)

    glassesContainer.scale.setScalar(1)
    scene.add(glassesContainer)

    loadFaceOccluder()
  }

  const updateSize = () => {
    if (!renderer || !camera) return

    const width = window.innerWidth
    const height = window.innerHeight

    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const loadFaceOccluder = () => {
    const loader = new OBJLoader()

    loader.load(
      '/models/canonical_face_model.obj',
      (obj) => {
        const mat = new THREE.MeshDepthMaterial({
          depthWrite: true,
          colorWrite: false
        })

        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = mat
          }
        })

        faceOccluder.value = obj
        scene.add(obj)
      },
      undefined,
      (err) => {
        console.warn("Impossible de charger l'occluteur facial.", err)
      }
    )
  }

  const disposeHierarchy = (obj: THREE.Object3D) => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose()

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose())
          } else {
            child.material.dispose()
          }
        }
      }
    })
  }

  const loadGlasses = (url?: string, scaleOffset = 1.0) => {
    if (!url || typeof url !== 'string') return

    const storageBase = useRuntimeConfig().public.apiBase.replace('/api', '') + '/storage/'
    if (url.startsWith(storageBase) || url.startsWith('http://localhost:8000/storage/')) {
      url = url.replace(/^https?:\/\/[^/]+\/storage\//, '/storage/')
    }

    if (glassesModel.value) {
      glassesContainer.remove(glassesModel.value)
      disposeHierarchy(glassesModel.value)
      glassesModel.value = null
    }

    const isGLB = url.includes('.glb') || url.includes('.gltf')

    if (isGLB) {
      const loader = new GLTFLoader()
      const draco = new DRACOLoader()
      draco.setDecoderPath('/draco/')
      loader.setDRACOLoader(draco)

      loader.load(
        url,
        (gltf) => {
          attachModel(gltf.scene, scaleOffset)
          draco.dispose()
        },
        undefined,
        (error) => {
          console.error('❌ ERREUR GLB:', error)
          draco.dispose()
        }
      )
    } else {
      const loader = new OBJLoader()
      loader.load(
        url,
        (obj) => {
          attachModel(obj, scaleOffset)
        },
        undefined,
        (error) => {
          console.error('❌ ERREUR OBJ:', error)
        }
      )
    }
  }

  const attachModel = (model: THREE.Object3D, scaleOffset: number) => {
    /**
     * Normalisation de base du modèle
     * On garde une largeur réaliste avant l’ajustement dynamique.
     */
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const safeWidth = Math.max(size.x, 0.0001)
    const autoScale = TARGET_GLASSES_WIDTH / safeWidth
    model.scale.setScalar(autoScale)

    // Recalcul de la boîte après mise à l’échelle
    box.setFromObject(model)
    box.getSize(size)
    box.getCenter(center)

    // Recentrage horizontal + décalage vertical vers les yeux
    model.position.x = -center.x
    model.position.y = -center.y + size.y * 0.1

    // Plaquage contre le visage
    const zOffset = -0.02
    model.position.z = -box.max.z + zOffset

    model.traverse((c: any) => {
      if (c instanceof THREE.Mesh) {
        c.renderOrder = 1
        if (c.material) c.material.side = THREE.DoubleSide
      }
    })

    const pivot = new THREE.Group()
    pivot.add(model)

    /**
     * Ici on applique seulement l’offset de fichier.
     * L’échelle liée à la distance sera faite dans updatePose().
     */
    pivot.scale.setScalar(scaleOffset)

    pivot.position.set(
      calibration.positionX,
      calibration.positionY,
      calibration.positionZ
    )

    pivot.rotation.set(
      calibration.rotationX,
      calibration.rotationY,
      calibration.rotationZ
    )

    glassesModel.value = pivot
    glassesContainer.add(pivot)
  }

  const renderFrame = () => {
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  const updatePose = (matrixArray: number[]) => {
    const matrix = new THREE.Matrix4().fromArray(matrixArray)

    // MediaPipe -> Three.js
    matrix.transpose()

    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const scale = new THREE.Vector3()

    matrix.decompose(pos, quat, scale)

    // Lissage position + rotation pour réduire le tremblement
    smoothedPos.lerp(pos, 0.25)
    smoothedQuat.slerp(quat, 0.25)

    glassesContainer.position.copy(smoothedPos)
    glassesContainer.quaternion.copy(smoothedQuat)

    const depth = Math.max(0.15, Math.abs(smoothedPos.z))
    const depthScale = THREE.MathUtils.clamp(
      REFERENCE_DEPTH / depth,
      DYNAMIC_SCALE_MIN,
      DYNAMIC_SCALE_MAX
    )

    const matrixScale = (scale.x + scale.y + scale.z) / 3
    const safeMatrixScale = Number.isFinite(matrixScale) && matrixScale > 0.01
      ? matrixScale
      : 1

    const targetScale = THREE.MathUtils.clamp(
      (safeMatrixScale * 0.45 + depthScale * 0.55) * calibration.scale,
      DYNAMIC_SCALE_MIN,
      DYNAMIC_SCALE_MAX
    )

    smoothedDynamicScale = THREE.MathUtils.lerp(
      smoothedDynamicScale,
      targetScale,
      DYNAMIC_SCALE_LERP
    )

    glassesContainer.scale.setScalar(smoothedDynamicScale)

    if (faceOccluder.value) {
      faceOccluder.value.position.copy(smoothedPos)
      faceOccluder.value.quaternion.copy(smoothedQuat)
      faceOccluder.value.scale.setScalar(smoothedDynamicScale)
    }
  }

  return {
    initScene,
    renderFrame,
    updatePose,
    updateSize,
    loadGlasses,
    glassesModel,
    calibration
  }
}