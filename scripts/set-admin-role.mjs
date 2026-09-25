/* eslint-env node */
/* global process, console */
/**
 * Seta custom claim de role num usuário Firebase Auth.
 * Uso: node --env-file=.env scripts/set-admin-role.mjs <email> [role]
 * role: owner | admin | moderator | member (default: admin)
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
const [email, role = 'admin'] = process.argv.slice(2)
const VALID = ['owner', 'admin', 'moderator', 'member']

if (!serviceAccount || !email) {
  console.error('Uso: node --env-file=.env scripts/set-admin-role.mjs <email> [role]')
  process.exit(1)
}
if (!VALID.includes(role)) {
  console.error(`Role inválida: ${role}. Válidas: ${VALID.join(', ')}`)
  process.exit(1)
}

const app = getApps()[0] || initializeApp({ credential: cert(serviceAccount) })
const auth = getAuth(app)

try {
  const user = await auth.getUserByEmail(email)
  await auth.setCustomUserClaims(user.uid, { role })
  console.log(`✓ ${email} (uid: ${user.uid}) → role: ${role}`)
} catch (e) {
  console.error(
    'Erro:',
    e.code === 'auth/user-not-found'
      ? `Usuário ${email} não existe no Firebase Auth (precisa criar primeiro: scripts/create-admin-user.mjs)`
      : e.message,
  )
  process.exit(1)
}
process.exit(0)
