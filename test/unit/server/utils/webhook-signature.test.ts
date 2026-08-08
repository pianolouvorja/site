import { describe, it, expect } from 'vitest'
import { createHmac } from 'node:crypto'
import { verifyGithubSignature } from '~~/server/utils/webhook-signature'

describe('verifyGithubSignature', () => {
  it('returns false for empty signature', () => {
    expect(verifyGithubSignature('', 'payload', 'secret')).toBe(false)
  })

  it('returns false for signature without sha256= prefix', () => {
    expect(verifyGithubSignature('sha1=abc', 'payload', 'secret')).toBe(false)
  })

  // Real crypto test: compute HMAC with Node and verify
  it('returns true for valid sha256 signature', () => {
    const body = '{"action":"published"}'
    const secret = 'my-webhook-secret'
    const sig = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex')
    expect(verifyGithubSignature(sig, body, secret)).toBe(true)
  })

  it('returns false for wrong secret', () => {
    const body = '{"action":"published"}'
    const sig = 'sha256=' + createHmac('sha256', 'wrong').update(body).digest('hex')
    expect(verifyGithubSignature(sig, body, 'right')).toBe(false)
  })

  it('returns false for tampered payload', () => {
    const body = '{"action":"published"}'
    const sig = 'sha256=' + createHmac('sha256', 'secret').update(body).digest('hex')
    expect(verifyGithubSignature(sig, '{"action":"unpublished"}', 'secret')).toBe(false)
  })

  it('handles unicode payloads correctly', () => {
    const body = '{"name":"João","msg":"Açúcar"}'
    const secret = 's3cr3t'
    const sig = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex')
    expect(verifyGithubSignature(sig, body, secret)).toBe(true)
  })

  it('returns false when computed signature has different length', () => {
    // A truncated signature will have different length than computed
    expect(verifyGithubSignature('sha256=abc123', 'payload', 'secret')).toBe(false)
  })
})
