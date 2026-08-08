import { verifyMailConnection } from '../../utils/mail'
import { getSubscriberCount } from '../../utils/subscribers'

export default defineEventHandler(async () => {
  const smtp = await verifyMailConnection()
  const subscribers = await getSubscriberCount()

  return {
    smtp,
    subscribers,
  }
})
