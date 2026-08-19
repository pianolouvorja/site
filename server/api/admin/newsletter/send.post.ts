interface SendBody {
  subject: string
  body: string
  template: string
}

const BATCH_SIZE = 50
const BATCH_DELAY_MS = 2000

export default defineEventHandler(async (event) => {
  const body = await readBody<SendBody>(event)

  if (!body.subject || !body.body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: subject, body',
    })
  }

  const subs = await fetchSubscribers()
  if (subs.length === 0) {
    return {
      total: 0,
      sent: 0,
      failed: 0,
      errors: ['No subscribers found'],
    }
  }

  const emails = subs.filter((s) => s.active).map((s) => s.email)
  const errors: string[] = []
  let sent = 0
  let failed = 0

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE)
    const html = renderTemplate(body.template || 'announcement', {
      subject: body.subject,
      body: body.body,
      unsubscribeUrl: 'https://pianolouvorja.com.br',
    })

    const result = await sendMail({
      to: batch,
      subject: body.subject,
      html,
    })

    if (result.success) {
      sent += batch.length
    } else {
      failed += batch.length
      errors.push(result.error || 'Unknown error')
    }

    if (i + BATCH_SIZE < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  addToHistory({
    date: new Date().toISOString(),
    subject: body.subject,
    template: body.template || 'announcement',
    total: emails.length,
    sent,
    failed,
    errors,
  })

  return {
    total: emails.length,
    sent,
    failed,
    errors,
  }
})
