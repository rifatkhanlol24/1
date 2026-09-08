import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import config from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(config) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Realtime Database
export const db = getDatabase(app);

export const firebaseConfig = config;
