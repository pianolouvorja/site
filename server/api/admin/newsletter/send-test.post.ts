import { renderTemplate } from '~/server/utils/email-templates'
import { sendMail } from '~/server/utils/mail'

interface SendTestBody {
  to: string
  subject: string
  body: string
  template: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SendTestBody>(event)

  if (!body.to || !body.subject || !body.body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: to, subject, body',
    })
  }

  const html = renderTemplate(body.template || 'announcement', {
    subject: body.subject,
    body: body.body,
    unsubscribeUrl: 'https://pianolouvorja.com.br',
  })

  const result = await sendMail({
    to: body.to,
    subject: body.subject,
    html,
  })

  return result
})
