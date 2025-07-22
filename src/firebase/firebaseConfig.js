// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgpwbafw3jgtsXDQ4WK3l8PIOAQ745Kvk",
  authDomain: "nfts-bb29f.firebaseapp.com",
  projectId: "nfts-bb29f",
  storageBucket: "nfts-bb29f.appspot.com", // Note: should be .appspot.com, not .firebasestorage.app
  messagingSenderId: "989047203997",
  appId: "1:989047203997:web:99d6ae004ebf1a0c598c74",
  measurementId: "G-75FFFR8E6V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional, only if running in the browser)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Firestore
export const db = getFirestore(app);
