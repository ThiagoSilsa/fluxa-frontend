import { describe, expect, it } from 'vitest'
import { userCreateFormSchema, userEditFormSchema, userLinkFormSchema } from './user.schema'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MINIMAL_CREATE = {
  name: 'Analista',
  email: 'analista@somar.local',
  password: 'senha123',
  type: 'EMPLOYEE',
  roleId: 'role-1',
}

const MINIMAL_LINK = {
  email: 'maria@somar.local',
  type: 'EMPLOYEE',
  roleId: 'role-1',
}

const MINIMAL_EDIT = {
  name: 'Analista',
  email: 'analista@somar.local',
  type: 'EMPLOYEE',
  isActive: true,
  roleId: '',
}

// ---------------------------------------------------------------------------
// userCreateFormSchema
// ---------------------------------------------------------------------------
describe('userCreateFormSchema', () => {
  it('should accept a valid create payload', () => {
    const result = userCreateFormSchema.safeParse(MINIMAL_CREATE)

    expect(result.success).toBe(true)
  })

  describe('name', () => {
    it('should reject empty name', () => {
      const result = userCreateFormSchema.safeParse({ ...MINIMAL_CREATE, name: '' })

      expect(result.success).toBe(false)
    })

    it('should reject name with 1 character', () => {
      const result = userCreateFormSchema.safeParse({ ...MINIMAL_CREATE, name: 'A' })

      expect(result.success).toBe(false)
    })

    it('should reject name longer than 255 characters', () => {
      const result = userCreateFormSchema.safeParse({
        ...MINIMAL_CREATE,
        name: 'A'.repeat(256),
      })

      expect(result.success).toBe(false)
    })
  })

  describe('email', () => {
    it('should reject invalid email', () => {
      const result = userCreateFormSchema.safeParse({
        ...MINIMAL_CREATE,
        email: 'nao-e-email',
      })

      expect(result.success).toBe(false)
    })

    it('should reject empty email', () => {
      const result = userCreateFormSchema.safeParse({ ...MINIMAL_CREATE, email: '' })

      expect(result.success).toBe(false)
    })
  })

  describe('password', () => {
    it('should reject missing password', () => {
      const result = userCreateFormSchema.safeParse({
        ...MINIMAL_CREATE,
        password: '',
      })

      expect(result.success).toBe(false)
    })

    it('should reject password shorter than 6 characters', () => {
      const result = userCreateFormSchema.safeParse({
        ...MINIMAL_CREATE,
        password: '12345',
      })

      expect(result.success).toBe(false)
    })

    it('should reject password longer than 128 characters', () => {
      const result = userCreateFormSchema.safeParse({
        ...MINIMAL_CREATE,
        password: 'A'.repeat(129),
      })

      expect(result.success).toBe(false)
    })
  })

  describe('roleId', () => {
    it('should reject missing roleId', () => {
      const result = userCreateFormSchema.safeParse({ ...MINIMAL_CREATE, roleId: '' })

      expect(result.success).toBe(false)
    })
  })

  describe('type', () => {
    it('should reject invalid type', () => {
      const result = userCreateFormSchema.safeParse({
        ...MINIMAL_CREATE,
        type: 'CONVIDADO',
      })

      expect(result.success).toBe(false)
    })

    it('should default to EMPLOYEE when not provided', () => {
      const result = userCreateFormSchema.safeParse({
        name: MINIMAL_CREATE.name,
        email: MINIMAL_CREATE.email,
        password: MINIMAL_CREATE.password,
        roleId: MINIMAL_CREATE.roleId,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('EMPLOYEE')
      }
    })
  })

  describe('optional fields', () => {
    it('should accept empty phone and document', () => {
      const result = userCreateFormSchema.safeParse({
        ...MINIMAL_CREATE,
        phone: '',
        document: '',
      })

      expect(result.success).toBe(true)
    })

    it('should reject phone longer than 32 characters', () => {
      const result = userCreateFormSchema.safeParse({
        ...MINIMAL_CREATE,
        phone: '1'.repeat(33),
      })

      expect(result.success).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// userLinkFormSchema
// ---------------------------------------------------------------------------
describe('userLinkFormSchema', () => {
  it('should accept a valid link payload', () => {
    const result = userLinkFormSchema.safeParse(MINIMAL_LINK)

    expect(result.success).toBe(true)
  })

  it('should reject missing email', () => {
    const result = userLinkFormSchema.safeParse({ ...MINIMAL_LINK, email: '' })

    expect(result.success).toBe(false)
  })

  it('should reject missing roleId', () => {
    const result = userLinkFormSchema.safeParse({ ...MINIMAL_LINK, roleId: '' })

    expect(result.success).toBe(false)
  })

  it('should reject invalid type', () => {
    const result = userLinkFormSchema.safeParse({
      ...MINIMAL_LINK,
      type: 'INVALIDO',
    })

    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// userEditFormSchema
// ---------------------------------------------------------------------------
describe('userEditFormSchema', () => {
  it('should accept a valid edit payload', () => {
    const result = userEditFormSchema.safeParse(MINIMAL_EDIT)

    expect(result.success).toBe(true)
  })

  it('should accept empty roleId (sem cargo)', () => {
    const result = userEditFormSchema.safeParse({ ...MINIMAL_EDIT, roleId: '' })

    expect(result.success).toBe(true)
  })

  it('should accept empty password (não altera)', () => {
    const result = userEditFormSchema.safeParse({ ...MINIMAL_EDIT, password: '' })

    expect(result.success).toBe(true)
  })

  it('should reject empty name', () => {
    const result = userEditFormSchema.safeParse({ ...MINIMAL_EDIT, name: '' })

    expect(result.success).toBe(false)
  })

  it('should accept isActive false', () => {
    const result = userEditFormSchema.safeParse({
      ...MINIMAL_EDIT,
      isActive: false,
    })

    expect(result.success).toBe(true)
  })
})
