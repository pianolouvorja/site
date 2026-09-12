import { buildBuckets, resolvePeriod } from '../../utils/timeseries-buckets'
import {
  fetchDownloadsSeries,
  fetchSubscribersSeries,
  fetchVisitsSeries,
} from '../../utils/timeseries-sources'

/** GET /api/admin/timeseries?period=7d|30d|12m */
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const query = getQuery(event)
  const period = resolvePeriod(typeof query.period === 'string' ? query.period : undefined)
  const buckets = buildBuckets(period)
  const zero = () => buckets.map((key) => ({ key, value: 0 }))

  const [visits, subscribers, downloads] = await Promise.all([
    fetchVisitsSeries(buckets).catch(() => zero()),
    fetchSubscribersSeries(buckets).catch(() => zero()),
    fetchDownloadsSeries(buckets).catch(() => zero()),
  ])

  setHeader(event, 'cache-control', 'private, max-age=300')
  return { period, buckets, visits, subscribers, downloads }
})
