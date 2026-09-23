import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCfEHvs3WGOX_l4mbY_n05NeyfDH6Nrwy8",
  authDomain: "thecodingweb.firebaseapp.com",
  projectId: "thecodingweb",
  storageBucket: "thecodingweb.firebasestorage.app",
  messagingSenderId: "387263553669",
  appId: "1:387263553669:web:63307263091d144079c9ec",
  measurementId: "G-ZKYQ2ZTF2P"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export default app
