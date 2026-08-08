import { describe, it, expect } from 'vitest'
import { EMAIL_BRAND_TOKENS } from '~~/server/utils/email-brand'

describe('EMAIL_BRAND_TOKENS', () => {
  it('exports cyan as piano-cyan #00c1e6', () => {
    expect(EMAIL_BRAND_TOKENS.cyan).toBe('#00c1e6')
  })

  it('exports cyanLight as #5dd9f0', () => {
    expect(EMAIL_BRAND_TOKENS.cyanLight).toBe('#5dd9f0')
  })

  it('exports yellow as piano-yellow #fcce02', () => {
    expect(EMAIL_BRAND_TOKENS.yellow).toBe('#fcce02')
  })

  it('exports yellowDark as #e0b800', () => {
    expect(EMAIL_BRAND_TOKENS.yellowDark).toBe('#e0b800')
  })

  it('exports dark as piano-dark #0a1733', () => {
    expect(EMAIL_BRAND_TOKENS.dark).toBe('#0a1733')
  })

  it('exports slate as #1e2a45', () => {
    expect(EMAIL_BRAND_TOKENS.slate).toBe('#1e2a45')
  })

  it('exports slateLight as #475569', () => {
    expect(EMAIL_BRAND_TOKENS.slateLight).toBe('#475569')
  })

  it('exports muted as #64748b', () => {
    expect(EMAIL_BRAND_TOKENS.muted).toBe('#64748b')
  })

  it('exports text as #e2e8f0', () => {
    expect(EMAIL_BRAND_TOKENS.text).toBe('#e2e8f0')
  })

  it('exports border as #1e293b', () => {
    expect(EMAIL_BRAND_TOKENS.border).toBe('#1e293b')
  })

  it('does NOT contain old wrong colors', () => {
    const values = Object.values(EMAIL_BRAND_TOKENS)
    expect(values).not.toContain('#22d3ee')
    expect(values).not.toContain('#f59e0b')
    expect(values).not.toContain('#0a0e1a')
  })

  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(EMAIL_BRAND_TOKENS)).toBe(true)
  })
})
