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
  })
  