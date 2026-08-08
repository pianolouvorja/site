import { getHistory } from '~/server/utils/newsletter-history'

export default defineEventHandler(() => {
  return {
    history: getHistory(),
  }
})
