// Vitest
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Service
import { buildUserSession } from './session.service'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockMakeRequest = vi.fn()

vi.mock('#/shared/controller/base.controller', () => ({
  default: { makeRequest: (...args: unknown[]) => mockMakeRequest(...args) },
}))

describe('buildUserSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('chama /auth/validate e enriquece a sessão com cargo e permissões', async () => {
    mockMakeRequest.mockResolvedValue({
      id: 'u1',
      companyId: 'c1',
      email: 'user@co.com',
      name: 'User',
      type: 'EMPLOYEE',
      roleCodes: ['Administração'],
      permissions: ['MANAGE_COMPANY', 'MANAGE_USERS'],
    })

    const session = await buildUserSession({
      accessToken: 'token',
      user: { id: 'u1', email: 'user@co.com', name: 'User', companyId: '' },
    })

    expect(mockMakeRequest).toHaveBeenCalledWith({ endpoint: '/auth/validate', method: 'GET' })
    expect(session.accessToken).toBe('token')
    expect(session.user.companyId).toBe('c1')
    expect(session.user.roleCodes).toEqual(['Administração'])
    expect(session.user.permissionCodes).toEqual(['MANAGE_COMPANY', 'MANAGE_USERS'])
    expect(session.user.type).toBe('EMPLOYEE')
  })

  it('preserva os dados da sessão básica quando o validate não traz campos novos', async () => {
    mockMakeRequest.mockResolvedValue({
      id: 'u1',
      companyId: 'c1',
      email: 'user@co.com',
      name: 'User',
      roleCodes: [],
      permissions: [],
    })

    const session = await buildUserSession({
      accessToken: 'token',
      user: { id: 'u1', email: 'user@co.com', name: 'User', companyId: 'c1' },
    })

    expect(session.user.id).toBe('u1')
    expect(session.user.email).toBe('user@co.com')
    expect(session.user.name).toBe('User')
    expect(session.user.roleCodes).toEqual([])
    expect(session.user.permissionCodes).toEqual([])
  })
})
