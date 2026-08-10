import nodemailer, { type Transporter } from 'nodemailer'
import { convert } from 'html-to-text'

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  const config = useRuntimeConfig()
  if (!config.smtpUser || !config.smtpPass) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    })
  }
  return transporter
}

export interface SendMailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendMail(
  options: SendMailOptions,
): Promise<{ success: boolean; error?: string }> {
  const config = useRuntimeConfig()
  const tp = getTransporter()
  if (!tp) {
    return { success: false, error: 'SMTP not configured' }
  }
  try {
    const textContent = convert(options.html, { wordwrap: 80 })
    await tp.sendMail({
      from: `"${config.smtpFromName}" <${config.smtpFromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      html: options.html,
      text: textContent,
      replyTo: options.replyTo,
    })
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[mail] Error:', msg)
    return { success: false, error: msg }
  }
}

export async function verifyMailConnection(): Promise<{
  configured: boolean
  connected: boolean
  error?: string
}> {
  const config = useRuntimeConfig()
  if (!config.smtpUser || !config.smtpPass) {
    return { configured: false, connected: false }
  }
  const tp = getTransporter()
  if (!tp) return { configured: false, connected: false }
  try {
    await tp.verify()
    return { configured: true, connected: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { configured: true, connected: false, error: msg }
  }
}
