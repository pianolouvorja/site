import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

let app: FirebaseApp | null = null
let authInstance: Auth | null = null

export function useFirebaseClient(): Auth {
  // Client-only — never run on server
  if (import.meta.server) {
    throw new Error('useFirebaseClient can only be used on the client')
  }

  if (authInstance) return authInstance

  const config = useRuntimeConfig().public

  // Don't initialize if credentials are missing
  if (!config.firebaseApiKey || !config.firebaseAppId) {
    throw new Error('Firebase configuration missing. Check your .env file.')
  }

  app = getApps().length
    ? getApps()[0]!
    : initializeApp({
        apiKey: config.firebaseApiKey,
        authDomain: config.firebaseAuthDomain,
        projectId: config.firebaseProjectId,
        storageBucket: config.firebaseStorageBucket,
        messagingSenderId: config.firebaseMessagingSenderId,
        appId: config.firebaseAppId,
      })

  authInstance = getAuth(app)
  return authInstance
}
