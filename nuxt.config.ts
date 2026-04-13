// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  runtimeConfig: {
    public: {
      firebaseApiKey: 'AIzaSyDacAZAfo_L05z2okPdebOXe1mYVDCyyrk',
      firebaseAuthDomain: 'wishlist-a64f9.firebaseapp.com',
      firebaseProjectId: 'wishlist-a64f9',
      firebaseStorageBucket: 'wishlist-a64f9.firebasestorage.app',
      firebaseMessagingSenderId: '581419988392',
      firebaseAppId: '1:581419988392:web:0c9e6d1ca929a5e039d99d',
    },
  },
})
