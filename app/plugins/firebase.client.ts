import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

/**
 * Firebase initialization plugin.
 * Reads public config from runtimeConfig and initializes Firebase App + Auth.
 * Safe-guards against SSR (auth is client-only).
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public

  const firebaseConfig = {
    apiKey: config.firebaseApiKey,
    authDomain: config.firebaseAuthDomain,
    projectId: config.firebaseProjectId,
    storageBucket: config.firebaseStorageBucket,
    messagingSenderId: config.firebaseMessagingSenderId,
    appId: config.firebaseAppId,
  }

  // Skip init if credentials not configured (e.g. dev without env)
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('[firebase] Missing config — set FIREBASE_* env vars')
    return
  }

  const app: FirebaseApp = initializeApp(firebaseConfig)
  const auth: Auth = getAuth(app)

  return {
    provide: {
      firebaseApp: app,
      firebaseAuth: auth,
    },
  }
})
