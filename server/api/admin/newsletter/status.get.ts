export default defineEventHandler(async () => {
  const smtp = await verifyMailConnection()
  const subscribers = await getSubscriberCount()

  return {
    smtp,
    subscribers,
  }
})
