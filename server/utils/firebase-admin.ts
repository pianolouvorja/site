import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

let app: App | null = null

export function getFirebaseAdmin(): App {
  if (app) return app

  if (getApps().length > 0) {
    app = getApps()[0]!
    return app
  }

  const config = useRuntimeConfig()
  const path = config.firebaseServiceAccountPath as string

  if (!path) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Firebase service account path not configured',
    })
  }

  try {
    const serviceAccountPath = resolve(process.cwd(), path)
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))

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
