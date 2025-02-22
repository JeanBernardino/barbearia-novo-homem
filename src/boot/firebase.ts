import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"


async function loadFirebaseConfig() {
    const response = await fetch('/firebase.json') // Busca o JSON na raiz do projeto
    return response.json()
}

// Sua configuração do Firebase, obtida no console do Firebase
const firebaseConfig = await loadFirebaseConfig()

// Inicialize o Firebase
const firebaseApp = initializeApp(firebaseConfig)

// Configure os serviços que você vai usar
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

// Exporte os serviços
export { auth, db, storage }
