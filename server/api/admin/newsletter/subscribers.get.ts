import { fetchSubscribers } from '~/server/utils/subscribers'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = (query.search as string | undefined)?.toLowerCase() || ''

  const all = await fetchSubscribers()
  const filtered = search ? all.filter((s) => s.email.toLowerCase().includes(search)) : all

  return {
    subscribers: filtered,
    total: all.length,
  }
})
