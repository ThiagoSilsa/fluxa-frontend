// Vitest
import { describe, expect, it } from 'vitest'

// Types
import { isLoginSession } from './login.types'
import type { LoginResponse } from './login.types'

describe('isLoginSession', () => {
  it('retorna true para um desfecho de sessão', () => {
    const response: LoginResponse = {
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 28800,
      user: { id: 'u1', name: 'User', email: 'user@co.com' },
    }

    expect(isLoginSession(response)).toBe(true)
  })

  it('retorna false para um desfecho de escolha de empresa', () => {
    const response: LoginResponse = {
      requiresCompanyChoice: true,
      companies: [
        { id: 'c1', name: 'SOMAR' },
        { id: 'c2', name: 'Autarquia B' },
      ],
    }

    expect(isLoginSession(response)).toBe(false)
  })
})
