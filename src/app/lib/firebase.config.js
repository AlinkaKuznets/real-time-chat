import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzI69DEo6ciT4O__QF6u_r-Cp_zNmiVfs",
  authDomain: "realtimechat-9e43c.firebaseapp.com",
  databaseURL: "https://realtimechat-9e43c-default-rtdb.firebaseio.com",
  projectId: "realtimechat-9e43c",
  storageBucket: "realtimechat-9e43c.firebasestorage.app",
  messagingSenderId: "208936780928",
  appId: "1:208936780928:web:1c543b5b3f21ee8e181265",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
