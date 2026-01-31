import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBdPE4YTJcgeXnVoQdF5-qrJzun9QoKss0",
    authDomain: "digit-destiny.firebaseapp.com",
    projectId: "digit-destiny",
    storageBucket: "digit-destiny.firebasestorage.app",
    messagingSenderId: "974905155586",
    appId: "1:974905155586:web:904389bdfc2fa1f860071b",
    measurementId: "G-8TF4DH6X47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
