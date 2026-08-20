import { renderTemplate } from '~~/server/utils/email-templates'

interface PreviewBody {
  template?: string
  subject?: string
  body?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<PreviewBody>(event)

  if (!body?.body) {
    throw createError({ statusCode: 400, statusMessage: 'Missing body' })
  }

  const html = renderTemplate(body.template || 'announcement', {
    subject: body.subject || 'Preview',
    body: body.body,
    unsubscribeUrl: '#',
  })

  return { html }
})
