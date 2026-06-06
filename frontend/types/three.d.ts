// Déclarations de type pour Three.js
declare module 'three' {
    // Export toutes les classes et types de Three.js
    export class Scene { }
    export class WebGLRenderer {
        constructor(options?: any)
        setSize(width: number, height: number): void
        setPixelRatio(ratio: number): void
        render(scene: Scene, camera: any): void
    }
    export class PerspectiveCamera {
        constructor(fov: number, aspect: number, near: number, far: number)
        position: any
        aspect: number
        updateProjectionMatrix(): void
    }
    export class Group {
        add(object: any): void
        position: Vector3
        quaternion: Quaternion
        rotation: any
        scale: Vector3
        traverse(callback: (child: any) => void): void
    }
    export class Object3D {
        position: Vector3
        quaternion: Quaternion
        scale: Vector3
        material: any
        traverse(callback: (child: any) => void): void
    }
    export class AmbientLight {
        constructor(color?: number, intensity?: number)
    }
    export class DirectionalLight {
        constructor(color?: number, intensity?: number)
        position: Vector3
    }
    export class Vector3 {
        constructor(x?: number, y?: number, z?: number)
        lerp(target: Vector3, alpha: number): Vector3
        sub(v: Vector3): Vector3
        copy(v: Vector3): Vector3
        setScalar(scalar: number): Vector3
    }
    export class Quaternion {
        slerp(qb: Quaternion, t: number): Quaternion
        copy(q: Quaternion): Quaternion
    }
    export class Matrix4 {
        fromArray(array: number[]): Matrix4
        decompose(position: Vector3, quaternion: Quaternion, scale: Vector3): Matrix4
    }
    export class Box3 {
        setFromObject(obj: any): Box3
        getCenter(target: Vector3): Vector3
    }
    export class Mesh extends Object3D {
        material: any
    }
    export class MeshDepthMaterial {
        constructor(options?: any)
    }
    export interface GLTF {
        scene: Group
        scenes: Group[]
        animations: any[]
        asset: any
        parser: any
        userData: any
    }
}

declare module 'three/examples/jsm/loaders/DRACOLoader' {
    export class DRACOLoader {
        setDecoderPath(path: string): void
        dispose(): void
    }
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
    import * as THREE from 'three'
    export class GLTFLoader {
        setDRACOLoader(loader: any): void
        load(
            url: string,
            onLoad: (gltf: THREE.GLTF) => void,
            onProgress?: (event: ProgressEvent) => void,
            onError?: (event: ErrorEvent) => void
        ): void
    }
}

declare module 'three/examples/jsm/loaders/OBJLoader' {
    import * as THREE from 'three'
    export class OBJLoader {
        load(
            url: string,
            onLoad: (object: THREE.Group) => void,
            onProgress?: (event: ProgressEvent) => void,
            onError?: (event: ErrorEvent) => void
        ): void
    }
}

