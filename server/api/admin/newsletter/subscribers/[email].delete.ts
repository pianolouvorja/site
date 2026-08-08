export default defineEventHandler(async (event) => {
  const email = getRouterParam(event, 'email')

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email parameter required',
    })
  }

  const success = await removeSubscriber(decodeURIComponent(email))
  return { success }
})
