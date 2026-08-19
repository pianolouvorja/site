export interface NewsletterSendRecord {
  date: string
  subject: string
  template: string
  total: number
  sent: number
  failed: number
  errors: string[]
}

const MAX_HISTORY = 50
const history: NewsletterSendRecord[] = []

export function addToNewsletterHistory(record: NewsletterSendRecord): void {
  history.unshift(record)
  if (history.length > MAX_HISTORY) {
    history.pop()
  }
}

export function getNewsletterHistory(): readonly NewsletterSendRecord[] {
  return history
}

export function clearNewsletterHistoryForTesting(): void {
  history.length = 0
}
