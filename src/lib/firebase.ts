import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import config from '../../firebase-applet-config.json';

// Ensure databaseURL is always set for Realtime Database
export const RTDB_URL =
  (config as { databaseURL?: string }).databaseURL ||
  'https://social-media1bd-default-rtdb.asia-southeast1.firebasedatabase.app';

export const firebaseConfig = {
  ...config,
  databaseURL: RTDB_URL,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Realtime Database
export const rtdb = getDatabase(app, RTDB_URL);
