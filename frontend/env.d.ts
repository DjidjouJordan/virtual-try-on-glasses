// Nuxt auto-imports
declare module '#app' {
    interface NuxtApp {
        // Add auto-imported types
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomOptions {
        // Add custom options
    }
}

// Three.js type declarations
declare module 'three' {
    // Allow implicit any for three module
}

declare module 'three/examples/jsm/loaders/DRACOLoader' {
    // Allow implicit any for DRACOLoader
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
    // Allow implicit any for GLTFLoader
}

declare module 'three/examples/jsm/loaders/OBJLoader' {
    // Allow implicit any for OBJLoader
}

export { };

