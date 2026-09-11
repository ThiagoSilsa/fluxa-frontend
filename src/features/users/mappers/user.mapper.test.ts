import { describe, expect, it } from 'vitest'
import {
  buildUserListQuery,
  isPasswordChanged,
  isUserPromotion,
  normalizeUserFormDefaults,
  toCreateUserPayload,
  toLinkUserPayload,
  toUpdateUserPayload,
} from './user.mapper'

// ---------------------------------------------------------------------------
// normalizeUserFormDefaults
// ---------------------------------------------------------------------------
describe('normalizeUserFormDefaults', () => {
  it('should return empty defaults when user is undefined', () => {
    const result = normalizeUserFormDefaults()

    expect(result).toEqual({
      name: '',
      email: '',
      password: '',
      phone: '',
      document: '',
      type: 'EMPLOYEE',
      isActive: true,
      roleId: '',
    })
  })

  it('should map user entity values (including role) to form values', () => {
    const result = normalizeUserFormDefaults({
      id: 'user-1',
      name: 'Maria',
      email: 'maria@somar.local',
      phone: '11999999999',
      document: '12345678900',
      photoUrl: null,
      type: 'VISITOR',
      isActive: false,
      role: {
        userRoleId: 'ur-1',
        roleId: 'role-1',
        roleName: 'Porteiro',
        isAdmin: false,
      },
    })

    expect(result).toEqual({
      name: 'Maria',
      email: 'maria@somar.local',
      password: '',
      phone: '11999999999',
      document: '12345678900',
      type: 'VISITOR',
      isActive: false,
      roleId: 'role-1',
    })
  })

  it('should use empty roleId when user has no role', () => {
    const result = normalizeUserFormDefaults({
      id: 'user-2',
      name: 'João',
      email: 'joao@somar.local',
      phone: null,
      document: null,
      photoUrl: null,
      type: 'EMPLOYEE',
      isActive: true,
      role: null,
    })

    expect(result.roleId).toBe('')
  })
})

// ---------------------------------------------------------------------------
// toCreateUserPayload
// ---------------------------------------------------------------------------
describe('toCreateUserPayload', () => {
  const values = {
    name: '  Ana  ',
    email: '  ANA@somar.local ',
    password: 'senha123',
    phone: ' 11999999999 ',
    document: ' 12345678900 ',
    type: 'EMPLOYEE' as const,
    isActive: true,
    roleId: 'role-1',
  }

  it('should trim person fields and include roleId', () => {
    const result = toCreateUserPayload(values)

    expect(result).toEqual({
      email: 'ANA@somar.local',
      type: 'EMPLOYEE',
      name: 'Ana',
      password: 'senha123',
      phone: '11999999999',
      document: '12345678900',
      roleId: 'role-1',
    })
  })

  it('should omit empty optional person fields', () => {
    const result = toCreateUserPayload({
      ...values,
      phone: '   ',
      document: '',
    })

    expect(result.phone).toBeUndefined()
    expect(result.document).toBeUndefined()
  })

  describe('Visitante (ADR 0013)', () => {
    const visitorValues = {
      name: 'Visitante',
      email: '',
      password: '',
      phone: '',
      document: '',
      type: 'VISITOR' as const,
      isActive: true,
      roleId: '',
    }

    it('should omit email, password and roleId for a VISITOR', () => {
      const result = toCreateUserPayload(visitorValues)

      expect(result.type).toBe('VISITOR')
      expect(result.name).toBe('Visitante')
      expect(result.email).toBeUndefined()
      expect(result.password).toBeUndefined()
      expect(result.roleId).toBeUndefined()
    })

    it('should keep a visitor email when provided', () => {
      const result = toCreateUserPayload({
        ...visitorValues,
        email: ' visitante@somar.local ',
      })

      expect(result.email).toBe('visitante@somar.local')
      expect(result.password).toBeUndefined()
      expect(result.roleId).toBeUndefined()
    })
  })
})

// ---------------------------------------------------------------------------
// toLinkUserPayload
// ---------------------------------------------------------------------------
describe('toLinkUserPayload', () => {
  it('should send only email, type and roleId', () => {
    const result = toLinkUserPayload({
      name: 'Maria',
      email: ' maria@somar.local ',
      password: 'senha123',
      phone: '11999999999',
      document: '12345678900',
      type: 'EMPLOYEE',
      isActive: true,
      roleId: 'role-1',
    })

    expect(result).toEqual({
      email: 'maria@somar.local',
      type: 'EMPLOYEE',
      roleId: 'role-1',
    })
  })

  it('should omit roleId for a VISITOR', () => {
    const result = toLinkUserPayload({
      name: '',
      email: 'visitante@somar.local',
      password: '',
      phone: '',
      document: '',
      type: 'VISITOR',
      isActive: true,
      roleId: 'role-1',
    })

    expect(result).toEqual({ email: 'visitante@somar.local', type: 'VISITOR' })
    expect(result.roleId).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// toUpdateUserPayload
// ---------------------------------------------------------------------------
describe('toUpdateUserPayload', () => {
  const original = {
    name: 'Maria',
    email: 'maria@somar.local',
    password: '',
    phone: '11999999999',
    document: '12345678900',
    type: 'EMPLOYEE' as const,
    isActive: true,
    roleId: 'role-1',
  }

  it('should return empty payload when nothing changed', () => {
    const result = toUpdateUserPayload(original, original)

    expect(result).toEqual({})
  })

  it('should include only changed fields', () => {
    const result = toUpdateUserPayload({ ...original, name: 'Maria Silva', phone: '' }, original)

    expect(result).toEqual({ name: 'Maria Silva', phone: null })
  })

  it('should map empty roleId to null (remove role) when it changed', () => {
    const result = toUpdateUserPayload({ ...original, roleId: '' }, original)

    expect(result).toEqual({ roleId: null })
  })

  it('should send new roleId when it changed', () => {
    const result = toUpdateUserPayload({ ...original, roleId: 'role-2' }, original)

    expect(result).toEqual({ roleId: 'role-2' })
  })

  it('should not send roleId when unchanged', () => {
    const result = toUpdateUserPayload({ ...original, name: 'Outro' }, original)

    expect(result).toEqual({ name: 'Outro' })
  })

  it('should include isActive and type when changed', () => {
    const result = toUpdateUserPayload({ ...original, isActive: false, type: 'VISITOR' }, original)

    expect(result).toEqual({ isActive: false, type: 'VISITOR' })
  })

  it('should not send an empty email (Visitante sem e-mail — ADR 0013)', () => {
    const visitor = { ...original, email: '', type: 'VISITOR' as const }
    const result = toUpdateUserPayload({ ...visitor, name: 'Visitante' }, visitor)

    expect(result).toEqual({ name: 'Visitante' })
  })

  it('should send the email when promoting a visitor', () => {
    const visitor = {
      ...original,
      email: '',
      password: '',
      type: 'VISITOR' as const,
      roleId: '',
    }
    const result = toUpdateUserPayload(
      { ...visitor, email: 'visitante@somar.local', type: 'EMPLOYEE', roleId: 'role-1' },
      visitor,
    )

    expect(result).toEqual({
      email: 'visitante@somar.local',
      type: 'EMPLOYEE',
      roleId: 'role-1',
    })
  })
})

// ---------------------------------------------------------------------------
// isUserPromotion
// ---------------------------------------------------------------------------
describe('isUserPromotion', () => {
  const visitor = { ...normalizeUserFormDefaults(), type: 'VISITOR' as const }

  it('should be true only for VISITOR → EMPLOYEE', () => {
    expect(isUserPromotion({ ...visitor, type: 'EMPLOYEE' }, visitor)).toBe(true)
  })

  it('should be false when nothing changes', () => {
    expect(isUserPromotion(visitor, visitor)).toBe(false)
  })

  it('should be false when an EMPLOYEE stays EMPLOYEE', () => {
    const employee = { ...visitor, type: 'EMPLOYEE' as const }

    expect(isUserPromotion(employee, employee)).toBe(false)
  })

  it('should be false when demoting EMPLOYEE → VISITOR', () => {
    const employee = { ...visitor, type: 'EMPLOYEE' as const }

    expect(isUserPromotion(visitor, employee)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isPasswordChanged
// ---------------------------------------------------------------------------
describe('isPasswordChanged', () => {
  it('should return false when password is empty', () => {
    expect(isPasswordChanged({ password: '' } as never)).toBe(false)
  })

  it('should return false when password is whitespace only', () => {
    expect(isPasswordChanged({ password: '   ' } as never)).toBe(false)
  })

  it('should return true when password has content', () => {
    expect(isPasswordChanged({ password: 'novaSenha123' } as never)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// buildUserListQuery
// ---------------------------------------------------------------------------
describe('buildUserListQuery', () => {
  it('should always include limit and offset', () => {
    const result = buildUserListQuery({ limit: 20, offset: 0 })

    expect(result).toContain('limit=20')
    expect(result).toContain('offset=0')
  })

  it('should include search, type and isActive when provided', () => {
    const result = buildUserListQuery({
      search: 'mar',
      type: 'VISITOR',
      isActive: false,
      limit: 10,
      offset: 20,
    })

    expect(result).toContain('search=mar')
    expect(result).toContain('type=VISITOR')
    expect(result).toContain('isActive=false')
  })

  it('should encode special characters in search', () => {
    const result = buildUserListQuery({
      search: 'João & Cia',
      limit: 20,
      offset: 0,
    })

    expect(result).toContain('Jo%C3%A3o')
    expect(result).toContain('%26')
  })
})
