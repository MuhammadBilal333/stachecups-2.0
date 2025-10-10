export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
    devtools: { enabled: true },

    // Ignore stachecups-main folder
    ignore: ['stachecups-main/**'],

    modules: [
      '@pinia/nuxt',
      'nuxt-quasar-ui',
      '@nuxtjs/tailwindcss',
    ],

    css: [

      '~/assets/css/tailwind.css',
    ],

    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },

    tailwindcss: {
      exposeConfig: true,
    },

    quasar: {
      plugins: ['Loading', 'Notify', 'Dialog', 'Screen'],
      iconSet: 'mdi-v7',
      extras: {
        fontIcons: ['mdi-v7', 'material-icons'],
      },
    },

    plugins: [
      '~/plugins/vue-konva.client.ts',
    ],

    app: {
      head: {
        script: [
          { src: '/scripts/three.js' },
          { src: '/scripts/ColladaLoader2.js' },
        ],
      },
    },

    // Build optimizations
    vite: {
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Split large dependencies into separate chunks
              'three': ['three'],
              'konva': ['vue-konva', 'konva'],
              'quill': ['quill', '@vueup/vue-quill'],
              'vendor': ['axios', 'uuid'],
            },
          },
        },
      },
      optimizeDeps: {
        include: ['vue', 'pinia', '@vueuse/core'],
      },
    },

    // Performance optimizations
    experimental: {
      payloadExtraction: false,
      renderJsonPayloads: true,
      viewTransition: true,
    },

    // Nitro optimizations
    nitro: {
      compressPublicAssets: true,
      minify: true,
    },
  })
  