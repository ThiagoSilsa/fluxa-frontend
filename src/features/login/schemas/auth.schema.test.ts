// Vitest
import { describe, expect, it } from 'vitest'

// Schema
import { loginSchema } from './auth.schema'

describe('loginSchema', () => {
  it('aceita credenciais válidas', () => {
    const result = loginSchema.safeParse({ email: 'user@co.com', password: '123' })

    expect(result.success).toBe(true)
  })

  it('rejeita e-mail inválido com a chave de tradução', () => {
    const result = loginSchema.safeParse({ email: 'invalido', password: '123' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('form.errors.invalid-email')
    }
  })

  it('rejeita senha vazia com a chave de tradução', () => {
    const result = loginSchema.safeParse({ email: 'user@co.com', password: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('form.errors.invalid-password')
    }
  })
})
