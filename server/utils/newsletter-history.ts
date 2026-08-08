export interface SendRecord {
  date: string
  subject: string
  template: string
  total: number
  sent: number
  failed: number
  errors: string[]
}

const history: SendRecord[] = []
const MAX_HISTORY = 50

export function addToHistory(record: SendRecord): void {
  history.unshift(record)
  if (history.length > MAX_HISTORY) {
    history.pop()
  }
}

export function getHistory(): SendRecord[] {
  return history
}
