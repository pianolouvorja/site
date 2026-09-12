export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const email = getRouterParam(event, 'email')

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email parameter required',
    })
  }

  const success = await removeSubscriber(decodeURIComponent(email))
  if (!success) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Subscriber removal failed',
    })
  }
  return { success }
})
