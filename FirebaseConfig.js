import { initializeApp } from "firebase/app";
import { getAuth } from "firebase.auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyA_BFBUOhGrf_pe2ewuYbX3VIp17EdGgX4",
  authDomain: "collecti-c4ebc.firebaseapp.com",
  projectId: "collecti-c4ebc",
  storageBucket: "collecti-c4ebc.firebasestorage.app",
  messagingSenderId: "933285598239",
  appId: "1:933285598239:web:66892b0f2e0adbdf21b12a"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);