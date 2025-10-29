export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },



  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Raleway:wght@400;700&family=Poppins:wght@400;700&family=Nunito:wght@400;700&family=Inter:wght@400;700&family=Work+Sans:wght@400;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@400;700&family=Lora:wght@400;700&family=Crimson+Text:wght@400;700&family=Dancing+Script:wght@400;700&family=Pacifico&family=Great+Vibes&family=Caveat:wght@400;700&family=Sacramento&family=Satisfy&family=Shadows+Into+Light&family=Indie+Flower&family=Bebas+Neue&family=Permanent+Marker&family=Archivo+Black&family=Anton&family=Lobster&family=Righteous&family=Roboto+Mono:wght@400;700&display=swap'
        }
      ],
      script: [
        { src: '/scripts/three.js' },
        { src: '/scripts/ColladaLoader2.js' },
      ],
    },
  },


    quasar: {
    plugins: ['Loading', 'Notify', 'Dialog', 'Screen'],
    iconSet: 'mdi-v7',
    extras: {
      fontIcons: ['mdi-v7', 'material-icons'],
    },
  },

  
  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/monogram-fonts.css',
  ],
  modules: [
    '@nuxtjs/tailwindcss',
    '@tresjs/nuxt',
    '@pinia/nuxt',
    'nuxt-quasar-ui'
  ],

  plugins: [
    '~/plugins/vue-konva.client.ts',
  ],
})
