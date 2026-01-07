// config/firebase.tsx
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // ← CHỈ dùng getAuth
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD4JnSVAccNUSp6_0N4-A5zxcHQ3OYmiHU",
  authDomain: "applestore-app-85928.firebaseapp.com",
  projectId: "applestore-app-85928",
  storageBucket: "applestore-app-85928.firebasestorage.app",
  messagingSenderId: "94862180670",
  appId: "1:94862180670:web:97fe082932e07a17d8ec6f",
  measurementId: "G-XHY8R8LV0N"
};

// Khởi tạo Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// CHỈ sử dụng getAuth đơn giản
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };