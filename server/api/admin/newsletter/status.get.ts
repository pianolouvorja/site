import { verifyMailConnection } from '~/server/utils/mail'
import { getSubscriberCount } from '~/server/utils/subscribers'

export default defineEventHandler(async () => {
  const smtp = await verifyMailConnection()
  const subscribers = await getSubscriberCount()

  return {
    smtp,
    subscribers,
  }
})
