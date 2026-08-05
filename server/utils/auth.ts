import { type H3Event } from 'h3'
import { getFirebaseAdmin } from './firebase-admin'

export async function verifyAuthToken(event: H3Event): Promise<string | null> {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.substring(7)
  if (!token) return null

  try {
    const admin = getFirebaseAdmin()
    const { getAuth } = await import('firebase-admin/auth')
    const decoded = await getAuth(admin).verifyIdToken(token)
    return decoded.uid
  } catch {
    return null
  }
}

export async function requireAuth(event: H3Event): Promise<string> {
  const uid = await verifyAuthToken(event)
  if (!uid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
  return uid
}
