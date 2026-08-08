import { fetchSubscribers, type Subscriber } from '../../utils/subscribers'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = (query.search as string | undefined)?.toLowerCase() || ''

  const all: Subscriber[] = await fetchSubscribers()
  const filtered = search
    ? all.filter((s: Subscriber) => s.email.toLowerCase().includes(search))
    : all

  return {
    subscribers: filtered,
    total: all.length,
  }
})
