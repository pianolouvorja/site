import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'

let app: App | null = null

export function getFirebaseAdmin(): App {
  if (app) return app

  if (getApps().length > 0) {
    app = getApps()[0]!
    return app
  }

  const config = useRuntimeConfig()
  const json = config.firebaseServiceAccount as string

  if (!json) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Firebase service account not configured (set FIREBASE_SERVICE_ACCOUNT env var)',
    })
  }

  try {
    const serviceAccount = JSON.parse(json)

    app = initializeApp({
      credential: cert(serviceAccount),
    })

    return app
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to initialize Firebase Admin: ${(error as Error).message}`,
    })
  }
}
