// firebase.js or firebaseConfig.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCc5bjvaNs9RAMiQxpahuyZF7298Gv5Qe0',
  authDomain: 'drey-f8e6d.firebaseapp.com',
  projectId: 'drey-f8e6d',
  storageBucket: 'drey-f8e6d.appspot.com',
  messagingSenderId: '439693871832',
  appId: '1:439693871832:web:7548fa6b95ab4c1b5b65ad',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

const db = getFirestore(app);       // ✅ THIS IS THE DB YOU NEED
const storage = getStorage(app);

export { auth, db, storage };       // ✅ MUST export `db`
