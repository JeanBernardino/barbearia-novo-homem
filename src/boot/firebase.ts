import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"


// async function loadFirebaseConfig() {
//     const response = await fetch('/firebase.json') // Busca o JSON na raiz do projeto
//     return response.json()
// }

// // Sua configuração do Firebase, obtida no console do Firebase
// const firebaseConfig = await loadFirebaseConfig()

// Inicialize o Firebase
const firebaseApp = initializeApp({
    "apiKey": "AIzaSyBob6nAdGSbB65DRK2QtxOJPzMpF8qrUSU",
    "authDomain": "jean-barber-shop.firebaseapp.com",
    "projectId": "jean-barber-shop",
    "storageBucket": "jean-barber-shop.firebasestorage.app",
    "messagingSenderId": "314299530384",
    "appId": "1:314299530384:web:7d119f553f42f2719dac15"
}
)

// Configure os serviços que você vai usar
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

// Exporte os serviços
export { auth, db, storage }
