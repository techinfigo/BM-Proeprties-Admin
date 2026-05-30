import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBBXXuO3GpFmnu5lWEDZk1oLP6T8_frK2k",
  authDomain: "bm-properties-b8b9e.firebaseapp.com",
  projectId: "bm-properties-b8b9e",
  storageBucket: "bm-properties-b8b9e.firebasestorage.app",
  messagingSenderId: "784394030612",
  appId: "1:784394030612:web:d1b0eb9a6e26e039c0e101"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);