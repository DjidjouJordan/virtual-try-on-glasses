// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 1. Les modules d'abord (Recommandation ESLint)
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vite-pwa/nuxt',
    '@pinia/nuxt'
  ],

  components: true,

  // 2. Les configurations globales
  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/catalog': { ssr: false },
    '/try-on': { ssr: false },
  },
  devServer: {
    https: true,
    // Optionnel : pratique pour exposer sur ton réseau local et tester sur smartphone
    host: '0.0.0.0', 
    port: 3000
  },

  compatibilityDate: '2025-01-15',

  // Désactive temporairement le téléchargement distant si la connexion est instable
  nitro: {
    storage: {
      data: { driver: 'memory' }
    }
  },

  // Configuration TypeScript pour ignorer les erreurs de types Three.js
  typescript: {
    strict: false,
    typeCheck: false,
    tsConfig: {
      compilerOptions: {
        skipLibCheck: true,
        noImplicitAny: false,
        suppressImplicitAnyIndexErrors: true
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    defaults: {
      fallbacks: {
        'serif': [],
        'sans-serif': ['Arial']
      }
    }
  },

  // 3. La configuration des modules spécifiques
  pinia: {
    storesDirs: ['./app/stores/**']
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'DPGlassess AR',
      short_name: 'DPGlassess',
      theme_color: '#10B981',
      icons: [
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,wasm,task,glb,obj}'],
      runtimeCaching: [
        {
          // API Laravel — NetworkFirst : essaie le réseau, sinon cache
          urlPattern: /^http:\/\/localhost:8000\/api\/.*/,
          handler: 'NetworkFirst' as const,
          options: {
            cacheName: 'dpglasses-api',
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
          },
        },
        {
          // Modèles 3D + wasm — CacheFirst : rarement modifiés
          urlPattern: /\.(glb|obj|task|wasm)$/,
          handler: 'CacheFirst' as const,
          options: {
            cacheName: 'dpglasses-models',
            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          // Images montures depuis le backend
          urlPattern: /^http:\/\/localhost:8000\/storage\/.*/,
          handler: 'StaleWhileRevalidate' as const,
          options: {
            cacheName: 'dpglasses-images',
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
          },
        },
      ],
    }
  },
})
