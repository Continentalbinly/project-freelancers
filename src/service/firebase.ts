import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, initializeFirestore, Firestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId
)

let app: ReturnType<typeof initializeApp> | null = null
let auth: ReturnType<typeof getAuth> | null = null
let db: ReturnType<typeof getFirestore> | null = null
let storage: ReturnType<typeof getStorage> | null = null

if (isFirebaseConfigured) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApp()
  }
  
  auth = getAuth(app)
  
  // Configure Firestore with new cache API (replaces deprecated enableIndexedDbPersistence)
  if (typeof window !== 'undefined') {
    // Enable persistent cache for offline support and faster loads
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      })
    } catch (error) {
      // If already initialized, get the existing instance
      db = getFirestore(app)
    }
  } else {
    db = getFirestore(app)
  }
  
  storage = getStorage(app)
}

export { auth, db, storage }

/**
 * Helper to ensure db is not null
 * Throws error if db is null (Firebase not configured)
 */
export function requireDb(): Firestore {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check Firebase configuration.')
  }
  return db
}

/**
 * Helper to ensure auth is not null
 * Throws error if auth is null (Firebase not configured)
 */
export function requireAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check Firebase configuration.')
  }
  return auth
}

export function handleFirebaseError(error: Error | unknown) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  return {
    success: false,
    error: message
  }
}

export function successResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message
  }
}

export function convertTimestamp(timestamp: Record<string, unknown> | Date | unknown): Date {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as { toDate(): Date }).toDate()
  }
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date((timestamp as { seconds: number }).seconds * 1000)
  }
  return new Date(timestamp as string | number)
}


export default app 