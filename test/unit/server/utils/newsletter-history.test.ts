import { beforeEach, describe, expect, it } from 'vitest'
import {
  addToNewsletterHistory,
  clearNewsletterHistoryForTesting,
  getNewsletterHistory,
} from '../../../../server/utils/newsletter-history'

describe('newsletter history', () => {
  beforeEach(() => {
    clearNewsletterHistoryForTesting()
  })

  it('returns newest sends first', () => {
    addToNewsletterHistory({
      date: '2026-08-13T10:00:00.000Z',
      subject: 'First',
      template: 'announcement',
      total: 1,
      sent: 1,
      failed: 0,
      errors: [],
    })
    addToNewsletterHistory({
      date: '2026-08-13T11:00:00.000Z',
      subject: 'Second',
      template: 'announcement',
      total: 2,
      sent: 2,
      failed: 0,
      errors: [],
    })

    expect(getNewsletterHistory().map((entry) => entry.subject)).toEqual(['Second', 'First'])
  })

  it('retains only the 50 most recent sends', () => {
    for (let index = 0; index < 51; index += 1) {
      addToNewsletterHistory({
        date: String(index),
        subject: String(index),
        template: 'announcement',
        total: 1,
        sent: 1,
        failed: 0,
        errors: [],
      })
    }

    const history = getNewsletterHistory()
    expect(history).toHaveLength(50)
    expect(history[0]?.subject).toBe('50')
    expect(history.at(-1)?.subject).toBe('1')
  })
})
