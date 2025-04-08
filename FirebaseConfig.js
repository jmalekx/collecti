import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyA_BFBUOhGrf_pe2ewuYbX3VIp17EdGgX4",
  authDomain: "collecti-c4ebc.firebaseapp.com",
  projectId: "collecti-c4ebc",
  storageBucket: "collecti-c4ebc.firebasestorage.app",
  messagingSenderId: "933285598239",
  appId: "1:933285598239:web:66892b0f2e0adbdf21b12a",
};

//Initialse Firebase
const app = initializeApp(firebaseConfig);

//With persistense
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} 
catch (error) {
  //If already init, use getAuth
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } 
  else {
    throw error;
  }
}

export const FIREBASE_APP = app;
export const FIREBASE_AUTH = auth;
export const FIREBASE_DB = getFirestore(app);