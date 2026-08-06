/* eslint-env node */
/* global process, console */
/**
 * Script temporário: cria o usuário admin no Firebase Auth.
 * Rodar uma vez: node --env-file=.env scripts/create-admin-user.mjs
 *
 * Após criar, o admin entra com a senha provisória e troca no painel.
 */
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0]?.trim()
const tempPassword = 'Piano@2026'

if (!serviceAccount || !adminEmail) {
  console.error('Missing FIREBASE_SERVICE_ACCOUNT or ADMIN_EMAILS')
  process.exit(1)
}

const app = initializeApp({
  credential: cert(serviceAccount),
})

const auth = getAuth(app)

try {
  const user = await auth.createUser({
    email: adminEmail,
    password: tempPassword,
    emailVerified: true,
  })
  console.log(`✓ Admin user created: ${user.email} (uid: ${user.uid})`)
  console.log(`  Temporary password: ${tempPassword}`)
  console.log(`  ⚠ The admin must change this password on first login.`)
} catch (e) {
  if (e.code === 'auth/email-already-exists') {
    console.log(`User ${adminEmail} already exists. Resetting password...`)
    await auth.updateUser(adminEmail, { password: tempPassword })
    console.log(`✓ Password reset to temporary: ${tempPassword}`)
  } else {
    console.error('Error:', e.message)
    process.exit(1)
  }
}

process.exit(0)
