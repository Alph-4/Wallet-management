import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBs5ASjYXLgXzFxDBThmK5xPSDu0OrdURo",
  authDomain: "trader-portal-07pbwr.firebaseapp.com",
  databaseURL: "https://trader-portal-07pbwr-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "trader-portal-07pbwr",
  storageBucket: "trader-portal-07pbwr.appspot.com",
  messagingSenderId: "467512508402",
  appId: "1:467512508402:web:0cb2ee89f78cd1ae14756b",
  measurementId: "G-3ENTVXVKY0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
