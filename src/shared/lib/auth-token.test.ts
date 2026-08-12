import { describe, expect, it } from 'vitest'
import { parseTokenPayload, isTokenValid } from './auth-token'

// ---------------------------------------------------------------------------
// parseTokenPayload
// ---------------------------------------------------------------------------
describe('parseTokenPayload', () => {
  it('should return null for empty token', () => {
    expect(parseTokenPayload('')).toBeNull()
  })

  it('should return null for token without parts', () => {
    expect(parseTokenPayload('onlyone')).toBeNull()
  })

  it('should decode a valid JWT payload', () => {
    const payload = {
      sub: 'u1',
      companyId: 'c1',
      email: 'user@co.com',
      iat: 1000000,
      exp: 9999999999,
    }
    const base64 = btoa(JSON.stringify(payload))
    const token = `header.${base64}.signature`
    const result = parseTokenPayload(token)
    expect(result).toEqual(payload)
  })

  it('should return null for invalid base64 in payload', () => {
    const token = 'header.@@@invalid@@@.signature'
    const result = parseTokenPayload(token)
    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// isTokenValid
// ---------------------------------------------------------------------------
describe('isTokenValid', () => {
  it('should return false for null token', () => {
    expect(isTokenValid(null)).toBe(false)
  })

  it('should return false for expired token', () => {
    const payload = { sub: 'u1', companyId: 'c1', email: 'u@c.com', iat: 100, exp: 1 } // exp in the past
    const base64 = btoa(JSON.stringify(payload))
    const token = `header.${base64}.signature`
    expect(isTokenValid(token)).toBe(false)
  })

  it('should return true for valid non-expired token', () => {
    const future = Math.floor(Date.now() / 1000) + 3600 // 1h from now
    const payload = { sub: 'u1', companyId: 'c1', email: 'u@c.com', iat: 100, exp: future }
    const base64 = btoa(JSON.stringify(payload))
    const token = `header.${base64}.signature`
    expect(isTokenValid(token)).toBe(true)
  })
})
