// screens/firebase.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('✅ Firebase module loaded');

const firebaseConfig = {
  apiKey: "AIzaSyCc5bjvaNs9RAMiQxpahuyZF7298Gv5Qe0",
  authDomain: "drey-f8e6d.firebaseapp.com",
  projectId: "drey-f8e6d",
  storageBucket: "drey-f8e6d.appspot.com",
  messagingSenderId: "439693871832",
  appId: "1:439693871832:android:1cff4bece55c3fa15b65ad"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

console.log('✅ Auth object:', auth);

const db = getFirestore(app);
const storage = getStorage(app);


console.log('🔥 firebase.js loaded');

export { auth, db, storage };
