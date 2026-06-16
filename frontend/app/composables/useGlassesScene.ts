/**
 * COMPOSABLE : useGlassesScene
 * Projet : DPGlassess
 * Rôle : Gestion 3D avec recalibrage automatique et gestion du resize.
 */
import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { reactive, shallowRef } from 'vue'

export const useGlassesScene = () => {
  const scene = new THREE.Scene()
  let renderer: any = null
  let camera: any = null

  const glassesContainer = new THREE.Group()
  const glassesModel = shallowRef<any>(null)
  const faceOccluder = shallowRef<any>(null)

  const calibration = reactive({
    scale: 1.0,
    positionY: 1.7,
    positionZ: 0.0,
    rotationX: 0,
    rotationY: 4.6,
    rotationZ: 0
  })

  const initScene = (canvasElement: HTMLCanvasElement, _videoElement: HTMLVideoElement) => {
    const width = window.innerWidth
    const height = window.innerHeight

    renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      alpha: true,
      antialias: true
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 5

    scene.add(new THREE.AmbientLight(0xffffff, 2.0))
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(0, 5, 5)
    scene.add(dirLight)

    scene.add(glassesContainer)
    loadFaceOccluder()
  }

  /**
   * ÉTAPE LOGIQUE : updateSize
   * Cette fonction est appelée lors du redimensionnement de la fenêtre.
   */
  const updateSize = () => {
    if (!renderer || !camera) return

    const width = window.innerWidth
    const height = window.innerHeight

    // 1. Mise à jour de la toile (Renderer)
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // 2. Mise à jour de la lentille (Caméra)
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    console.log('Rendu 3D mis à jour pour :', width, 'x', height)
  }

  const loadFaceOccluder = () => {
    const loader = new OBJLoader()
    loader.load('/models/canonical_face_model.obj', (obj: any) => {
      const mat = new THREE.MeshDepthMaterial({ depthWrite: true, colorWrite: false })
      obj.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          child.material = mat
        }
      })
      faceOccluder.value = obj
      scene.add(obj)
    })
  }

  const loadGlasses = (url: string, scaleOffset = 1.0) => {
    // Remove previous model
    if (glassesModel.value) {
      glassesContainer.remove(glassesModel.value)
      glassesModel.value = null
    }

    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    loader.setDRACOLoader(dracoLoader)

    loader.load(url, (gltf: any) => {
      const model = gltf.scene
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)

      // Glasses must render after the face occluder so depth-testing works correctly
      model.traverse((child: any) => { child.renderOrder = 1 })

      const pivot = new THREE.Group()
      pivot.add(model)

      pivot.scale.setScalar(calibration.scale * scaleOffset)
      pivot.position.set(0, calibration.positionY, calibration.positionZ)
      pivot.rotation.set(calibration.rotationX, calibration.rotationY, calibration.rotationZ)

      glassesModel.value = pivot
      glassesContainer.add(pivot)
      dracoLoader.dispose()
    })
  }

  const lastPos = new THREE.Vector3()
  const lastQuat = new THREE.Quaternion()
  const smoothingFactor = 0.3

  const updatePose = (matrixArray: number[]) => {
    if (!matrixArray || !glassesContainer) return

    const matrix = new THREE.Matrix4().fromArray(matrixArray)
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const scl = new THREE.Vector3()
    matrix.decompose(pos, quat, scl)

    lastPos.lerp(pos, smoothingFactor)
    lastQuat.slerp(quat, smoothingFactor)

    glassesContainer.position.copy(lastPos)
    glassesContainer.quaternion.copy(lastQuat)
    glassesContainer.scale.copy(scl)

    if (faceOccluder.value) {
      faceOccluder.value.position.copy(lastPos)
      faceOccluder.value.quaternion.copy(lastQuat)
      faceOccluder.value.scale.copy(scl)
    }
  }

  const renderFrame = () => {
    if (renderer && camera) renderer.render(scene, camera)
  }

  return { initScene, renderFrame, updatePose, updateSize, loadGlasses, glassesModel, calibration }
}
