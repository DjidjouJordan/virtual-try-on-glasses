/// <reference types="./types/three" />

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

// Ensure three types are available
declare module 'three' {
    // Forward declaration to ensure module resolution
}
