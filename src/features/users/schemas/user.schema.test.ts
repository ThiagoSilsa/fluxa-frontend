import { describe, expect, it } from 'vitest'
import { buildUserEditFormSchema, userCreateFormSchema, userLinkFormSchema } from './user.schema'

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

/** Verifica a mensagem (chave i18n) de um campo. */
function hasIssue(
  result: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } },
  path: string,
  message: string,
): boolean {
  if (result.success || !result.error) {
    return false
  }
  return result.error.issues.some((issue) => issue.path[0] === path && issue.message === message)
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

  describe('Visitante (ADR 0013)', () => {
    const VISITOR_CREATE = { name: 'Visitante', type: 'VISITOR' }

    it('should accept a VISITOR without email, password and role', () => {
      expect(userCreateFormSchema.safeParse(VISITOR_CREATE).success).toBe(true)
    })

    it('should accept a VISITOR with email', () => {
      const result = userCreateFormSchema.safeParse({
        ...VISITOR_CREATE,
        email: 'visitante@somar.local',
      })

      expect(result.success).toBe(true)
    })

    it('should reject an invalid visitor email', () => {
      const result = userCreateFormSchema.safeParse({ ...VISITOR_CREATE, email: 'nao-e-email' })

      expect(result.success).toBe(false)
      expect(hasIssue(result, 'email', 'form.errors.email-invalid')).toBe(true)
    })

    it('should require email, password and role for an EMPLOYEE', () => {
      const result = userCreateFormSchema.safeParse({ ...VISITOR_CREATE, type: 'EMPLOYEE' })

      expect(result.success).toBe(false)
      expect(hasIssue(result, 'email', 'form.errors.email-required')).toBe(true)
      expect(hasIssue(result, 'password', 'form.errors.password-required')).toBe(true)
      expect(hasIssue(result, 'roleId', 'form.errors.roleId-required')).toBe(true)
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

  it('should accept a VISITOR without role (cargo não se aplica)', () => {
    const result = userLinkFormSchema.safeParse({
      email: 'visitante@somar.local',
      type: 'VISITOR',
    })

    expect(result.success).toBe(true)
  })

  it('should require the email even for a VISITOR (chave do vínculo)', () => {
    const result = userLinkFormSchema.safeParse({ email: '', type: 'VISITOR', roleId: '' })

    expect(result.success).toBe(false)
    expect(hasIssue(result, 'email', 'form.errors.email-required')).toBe(true)
  })

  it('should require the role for an EMPLOYEE', () => {
    const result = userLinkFormSchema.safeParse({
      email: 'colaborador@somar.local',
      type: 'EMPLOYEE',
    })

    expect(result.success).toBe(false)
    expect(hasIssue(result, 'roleId', 'form.errors.roleId-required')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// buildUserEditFormSchema
// ---------------------------------------------------------------------------
describe('buildUserEditFormSchema', () => {
  const employeeEditSchema = buildUserEditFormSchema('EMPLOYEE')
  const visitorEditSchema = buildUserEditFormSchema('VISITOR')

  it('should accept a valid edit payload', () => {
    const result = employeeEditSchema.safeParse(MINIMAL_EDIT)

    expect(result.success).toBe(true)
  })

  it('should accept empty roleId (sem cargo)', () => {
    const result = employeeEditSchema.safeParse({ ...MINIMAL_EDIT, roleId: '' })

    expect(result.success).toBe(true)
  })

  it('should accept empty password (não altera)', () => {
    const result = employeeEditSchema.safeParse({ ...MINIMAL_EDIT, password: '' })

    expect(result.success).toBe(true)
  })

  it('should accept a password with at least 6 characters', () => {
    const result = employeeEditSchema.safeParse({
      ...MINIMAL_EDIT,
      password: 'senha123',
    })

    expect(result.success).toBe(true)
  })

  it('should reject a password shorter than 6 characters', () => {
    const result = employeeEditSchema.safeParse({ ...MINIMAL_EDIT, password: '12345' })

    expect(result.success).toBe(false)
  })

  it('should reject a password longer than 128 characters', () => {
    const result = employeeEditSchema.safeParse({
      ...MINIMAL_EDIT,
      password: 'A'.repeat(129),
    })

    expect(result.success).toBe(false)
  })

  it('should reject empty name', () => {
    const result = employeeEditSchema.safeParse({ ...MINIMAL_EDIT, name: '' })

    expect(result.success).toBe(false)
  })

  it('should accept isActive false', () => {
    const result = employeeEditSchema.safeParse({
      ...MINIMAL_EDIT,
      isActive: false,
    })

    expect(result.success).toBe(true)
  })

  describe('Visitante', () => {
    it('should accept a VISITOR without email, password and role', () => {
      const result = visitorEditSchema.safeParse({
        name: 'Visitante',
        type: 'VISITOR',
        isActive: true,
      })

      expect(result.success).toBe(true)
    })

    it('should reject an invalid visitor email', () => {
      const result = visitorEditSchema.safeParse({
        name: 'Visitante',
        email: 'nao-e-email',
        type: 'VISITOR',
        isActive: true,
      })

      expect(result.success).toBe(false)
      expect(hasIssue(result, 'email', 'form.errors.email-invalid')).toBe(true)
    })
  })

  describe('promoção Visitante → Colaborador', () => {
    it('should require email, role and password', () => {
      const result = visitorEditSchema.safeParse({
        name: 'Visitante',
        email: '',
        type: 'EMPLOYEE',
        isActive: true,
        roleId: '',
        password: '',
      })

      expect(result.success).toBe(false)
      expect(hasIssue(result, 'email', 'form.errors.email-required')).toBe(true)
      expect(hasIssue(result, 'roleId', 'form.errors.roleId-required')).toBe(true)
      expect(hasIssue(result, 'password', 'form.errors.password-required')).toBe(true)
    })

    it('should accept a promotion with email, role and password', () => {
      const result = visitorEditSchema.safeParse({
        name: 'Visitante',
        email: 'visitante@somar.local',
        type: 'EMPLOYEE',
        isActive: true,
        roleId: 'role-1',
        password: 'senha123',
      })

      expect(result.success).toBe(true)
    })

    it('should not require the password when an EMPLOYEE stays EMPLOYEE', () => {
      const result = employeeEditSchema.safeParse({
        ...MINIMAL_EDIT,
        password: '',
        roleId: '',
      })

      expect(result.success).toBe(true)
    })
  })
})
