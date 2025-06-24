// src/utils/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Añadimos Firestore

// Tu configuración (la que me compartiste)
const firebaseConfig = {
  apiKey: "AIzaSyBecnKsYSGMsLE9JmVzLgv3f7kO803BCQ4",
  authDomain: "lainertrack.firebaseapp.com",
  projectId: "lainertrack",
  storageBucket: "lainertrack.appspot.com", // Corregí esto
  messagingSenderId: "574911959521",
  appId: "1:574911959521:web:73431b526e5c1f4655c2a0"
};

// Inicialización
const app = initializeApp(firebaseConfig);

// Inicializamos Firestore
const db = getFirestore(app);

// Exportamos lo necesario
export { db };
