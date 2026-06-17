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

  const initScene = (canvas: HTMLCanvasElement) => {
    const width = window.innerWidth
    const height = window.innerHeight

    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    })

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 5

    scene.add(new THREE.AmbientLight(0xffffff, 2))
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(0, 5, 5)
    scene.add(light)

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

    loader.load('/models/canonical_face_model.obj', (obj: any) => {
      const mat = new THREE.MeshDepthMaterial({
        depthWrite: true,
        colorWrite: false
      })

      obj.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          child.material = mat
        }
      })

      faceOccluder.value = obj
      scene.add(obj)
    })
  }

  // 🔥 FIX MAJEUR ICI
  const loadGlasses = (url?: string, scaleOffset = 1.0) => {
    if (!url || typeof url !== 'string') {
      console.warn('❌ modèle 3D invalide:', url)
      return
    }

    // Rewrite absolute backend storage URLs to relative URLs to bypass CORS issues
    if (url.startsWith('http://localhost:8000/storage/')) {
      url = url.replace('http://localhost:8000/storage/', '/storage/')
    }

    if (glassesModel.value) {
      glassesContainer.remove(glassesModel.value)
      glassesModel.value = null
    }

    console.log('🔄 DEBUT CHARGEMENT LUNETTES:', url, 'scaleOffset:', scaleOffset)
    const isGLB = url.includes('.glb') || url.includes('.gltf')

    if (isGLB) {
      const loader = new GLTFLoader()
      const draco = new DRACOLoader()
      draco.setDecoderPath('/draco/')
      loader.setDRACOLoader(draco)

      loader.load(
        url,
        (gltf) => {
          console.log('✅ GLB CHARGÉ AVEC SUCCÈS:', url)
          attachModel(gltf.scene, scaleOffset)
          draco.dispose()
        },
        (xhr) => {
          if (xhr.total > 0) {
            console.log(`⏳ GLB PROGRESS: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`)
          }
        },
        (error) => {
          console.error('❌ ERREUR CHARGEMENT GLB:', error)
          draco.dispose()
        }
      )

    } else {
      const loader = new OBJLoader()

      loader.load(
        url,
        (obj) => {
          console.log('✅ OBJ CHARGÉ AVEC SUCCÈS:', url)
          attachModel(obj, scaleOffset)
        },
        (xhr) => {
          if (xhr.total > 0) {
            console.log(`⏳ OBJ PROGRESS: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`)
          }
        },
        (error) => {
          console.error('❌ ERREUR CHARGEMENT OBJ:', error)
        }
      )
    }
  }

  const attachModel = (model: any, scaleOffset: number) => {
    console.log('🔄 DEBUT ATTACHEMENT DU MODELE...')
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    console.log('📐 Dimensions brutes du modèle (X, Y, Z):', size.x, size.y, size.z, 'Centre:', center)

    model.position.sub(center)

    model.traverse((c: any) => (c.renderOrder = 1))

    const pivot = new THREE.Group()
    pivot.add(model)

    const finalScale = calibration.scale * scaleOffset
    console.log('⚖️ Echelle finale appliquée:', finalScale)
    pivot.scale.setScalar(finalScale)
    pivot.position.set(
      0,
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
    console.log('✅ MODELE LUNETTE AJOUTE AU CONTENEUR AVEC SUCCES!')
  }

  const renderFrame = () => {
    if (renderer && camera) {
      renderer.render(scene, camera)
    }
  }

  const updatePose = (matrixArray: number[]) => {
    const matrix = new THREE.Matrix4().fromArray(matrixArray)

    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const scale = new THREE.Vector3()

    matrix.decompose(pos, quat, scale)

    glassesContainer.position.copy(pos)
    glassesContainer.quaternion.copy(quat)
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