// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { canAccess } from './auth-access'

// Types
import type { AuthUser } from '#/shared/types/auth.types'

const user: AuthUser = {
  id: 'u1',
  email: 'user@fluxa.local',
  name: 'User',
  companyId: 'c1',
  roleCodes: ['ADMIN'],
  permissionCodes: ['MANAGE_USERS', 'MANAGE_ROLES'],
}

describe('canAccess', () => {
  it('libera quando não há requisitos', () => {
    expect(canAccess(user, {})).toBe(true)
    expect(canAccess(null, {})).toBe(true)
  })

  it('nega sem usuário quando há requisitos', () => {
    expect(canAccess(null, { permissions: ['MANAGE_USERS'] })).toBe(false)
    expect(canAccess(null, { roles: ['ADMIN'] })).toBe(false)
  })

  it('libera quando o usuário tem a permissão exigida', () => {
    expect(canAccess(user, { permissions: ['MANAGE_USERS'] })).toBe(true)
  })

  it('libera com qualquer uma das permissões (OR)', () => {
    expect(canAccess(user, { permissions: ['MANAGE_USERS', 'MANAGE_DEVICES'] })).toBe(true)
  })

  it('nega quando o usuário não tem nenhuma permissão exigida', () => {
    expect(canAccess(user, { permissions: ['MANAGE_DEVICES'] })).toBe(false)
  })

  it('libera quando o usuário tem o cargo exigido', () => {
    expect(canAccess(user, { roles: ['ADMIN'] })).toBe(true)
  })

  it('nega quando o usuário não tem o cargo exigido', () => {
    expect(canAccess(user, { roles: ['SUPER_ADMIN'] })).toBe(false)
  })

  it('role tem precedência sobre permissão', () => {
    // O cargo satisfaz mesmo sem a permissão exigida.
    expect(canAccess(user, { roles: ['ADMIN'], permissions: ['MANAGE_DEVICES'] })).toBe(true)
  })
})
