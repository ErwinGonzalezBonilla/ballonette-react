import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyC7-z7gAm4-vPULYkyamxbmV7arulO7Yg8",
  authDomain: "ballonette-clean.firebaseapp.com",
  projectId: "ballonette-clean",

  // 🔥 CAMBIO IMPORTANTE (TU BUCKET REAL)
  storageBucket: "ballonette-final-ok.firebasestorage.app",

  messagingSenderId: "1069339632576",
  appId: "1:1069339632576:web:cc2b755bb12200fb269e25"
}

const app = initializeApp(firebaseConfig)

// servicios
export const auth = getAuth(app)
export const db = getFirestore(app)

// 🔥 FORZAMOS el bucket correcto
export const storage = getStorage(app, "gs://ballonette-final-ok.firebasestorage.app")

export default app