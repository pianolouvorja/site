import { getNewsletterHistory } from '~~/server/utils/newsletter-history'

export default defineEventHandler(() => {
  return {
    history: getNewsletterHistory(),
  }
})
