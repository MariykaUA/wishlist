import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDacAZAfo_L05z2okPdebOXe1mYVDCyyrk',
  authDomain: 'wishlist-a64f9.firebaseapp.com',
  projectId: 'wishlist-a64f9',
  storageBucket: 'wishlist-a64f9.firebasestorage.app',
  messagingSenderId: '581419988392',
  appId: '1:581419988392:web:0c9e6d1ca929a5e039d99d',
}

export default defineNuxtPlugin(() => {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  const db = getFirestore(app)
  const storage = getStorage(app)

  return {
    provide: { db, storage },
  }
})
