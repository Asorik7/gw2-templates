import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4hzz0zf-0RA1B_daKpkrVG0r2o0V_uM8",
  authDomain: "gw2-templates.firebaseapp.com",
  projectId: "gw2-templates",
  storageBucket: "gw2-templates.firebasestorage.app",
  messagingSenderId: "611742314515",
  appId: "1:611742314515:web:917247bbda42f900070fe6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
