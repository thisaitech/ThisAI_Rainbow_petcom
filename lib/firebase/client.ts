import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const isPlaceholder = (value?: string) => {
  if (!value) {
    return true
  }

  const normalized = value.toLowerCase()

  return (
    normalized.includes('your-firebase') ||
    normalized.includes('your-project') ||
    normalized.includes('your-app') ||
    normalized.includes('your-auth-domain') ||
    normalized.includes('your-storage-bucket')
  )
}

export const hasFirebaseClientConfig = Boolean(
  firebaseEnv.apiKey &&
    firebaseEnv.authDomain &&
    firebaseEnv.projectId &&
    firebaseEnv.storageBucket &&
    firebaseEnv.appId &&
    !isPlaceholder(firebaseEnv.apiKey) &&
    !isPlaceholder(firebaseEnv.authDomain) &&
    !isPlaceholder(firebaseEnv.projectId) &&
    !isPlaceholder(firebaseEnv.storageBucket) &&
    !isPlaceholder(firebaseEnv.appId)
)

const getFirebaseAppConfig = () => {
  if (!hasFirebaseClientConfig) {
    throw new Error('Firebase client environment variables are not configured.')
  }

  return {
    apiKey: firebaseEnv.apiKey as string,
    authDomain: firebaseEnv.authDomain as string,
    projectId: firebaseEnv.projectId as string,
    storageBucket: firebaseEnv.storageBucket as string,
    messagingSenderId: firebaseEnv.messagingSenderId,
    appId: firebaseEnv.appId as string,
    measurementId: firebaseEnv.measurementId,
  }
}

export const getFirebaseClientApp = (): FirebaseApp =>
  getApps().length > 0 ? getApp() : initializeApp(getFirebaseAppConfig())

export const getFirebaseClientAuth = () => getAuth(getFirebaseClientApp())

export const getFirebaseClientDb = () => getFirestore(getFirebaseClientApp())

export const getFirebaseClientStorage = () => getStorage(getFirebaseClientApp())
