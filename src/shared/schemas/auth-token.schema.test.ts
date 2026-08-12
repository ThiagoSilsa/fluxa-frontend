// Vitest
import { describe, expect, it } from 'vitest'

// Schema
import { authTokenPayloadSchema } from './auth-token.schema'

describe('authTokenPayloadSchema', () => {
  it('aceita um payload válido do JWT', () => {
    const result = authTokenPayloadSchema.safeParse({
      sub: 'u1',
      companyId: 'c1',
      email: 'user@co.com',
      iat: 100,
      exp: 9999999999,
    })

    expect(result.success).toBe(true)
  })

  it('rejeita payload sem companyId', () => {
    const result = authTokenPayloadSchema.safeParse({
      sub: 'u1',
      email: 'user@co.com',
      iat: 100,
      exp: 9999999999,
    })

    expect(result.success).toBe(false)
  })

  it('rejeita payload com exp de tipo errado', () => {
    const result = authTokenPayloadSchema.safeParse({
      sub: 'u1',
      companyId: 'c1',
      email: 'user@co.com',
      iat: 100,
      exp: '999',
    })

    expect(result.success).toBe(false)
  })

  it('rejeita payload com sub vazio', () => {
    const result = authTokenPayloadSchema.safeParse({
      sub: '',
      companyId: 'c1',
      email: 'user@co.com',
      iat: 100,
      exp: 9999999999,
    })

    expect(result.success).toBe(false)
  })
})
