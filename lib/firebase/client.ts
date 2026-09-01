import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';
import { firebaseConfig, isFirebaseConfigured } from './config';

const app = isFirebaseConfigured() ? (getApps()[0] ?? initializeApp(firebaseConfig)) : null;

export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export async function getFirebaseMessaging() {
  if (!app) return null;
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
}
