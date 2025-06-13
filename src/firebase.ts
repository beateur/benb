// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTO1_jzVwiFIl_bPaMlA7MLRq6rp3vAKM",
  authDomain: "benb-74435.firebaseapp.com",
  projectId: "benb-74435",
  storageBucket: "benb-74435.firebasestorage.app",
  messagingSenderId: "924424518004",
  appId: "1:924424518004:web:071bf353c42a96f0ab9421",
  measurementId: "G-M853HQ4LPH"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Export auth functions
export { signInWithEmailAndPassword, onAuthStateChanged, signOut };

export default app;