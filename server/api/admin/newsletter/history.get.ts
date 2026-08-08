import { getHistory } from '../../utils/newsletter-history'

export default defineEventHandler(() => {
  return {
    history: getHistory(),
  }
})
