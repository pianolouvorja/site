export default defineEventHandler(async (event) => {
  const uid = await requireAuth(event)

  return {
    authenticated: true,
    uid,
  }
})
