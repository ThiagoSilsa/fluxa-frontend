import { describe, expect, it } from 'vitest'
import { accessRequestFormSchema } from './access-request.schema'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Base do cenário NEW_USER (veículo existente + motorista a criar). */
const NEW_USER = {
  type: 'NEW_USER',
  plate: '',
  vehicleId: '40000000-0000-0000-0000-000000000010',
  userId: '',
  contactChannel: 'WHATSAPP',
  contactPhone: '11999999999',
  driverName: 'Visitante',
  driverEmail: '',
  driverDocument: '',
  driverPhone: '',
  vehicleModel: '',
  vehicleColor: '',
}

/** Base do cenário BOTH (motorista + veículo a criar). */
const BOTH = {
  ...NEW_USER,
  type: 'BOTH',
  plate: 'ABC1D23',
  vehicleId: '',
  vehicleModel: 'Gol',
}

/** Base do cenário NEW_VEHICLE (usuário existente + veículo a criar). */
const NEW_VEHICLE = {
  ...NEW_USER,
  type: 'NEW_VEHICLE',
  plate: 'ABC1D23',
  vehicleId: '',
  userId: '30000000-0000-0000-0000-000000000005',
  driverName: '',
  vehicleModel: 'Gol',
}

/** Base do cenário LINK (veículo + usuário existentes). */
const LINK = {
  ...NEW_USER,
  type: 'LINK',
  plate: 'ABC1D23',
  userId: '30000000-0000-0000-0000-000000000005',
  contactPhone: '',
  driverName: '',
}

/**
 * Verifica se o erro de um campo aconteceu com a mensagem (chave i18n)
 * esperada.
 */
function hasIssue(
  result: ReturnType<typeof accessRequestFormSchema.safeParse>,
  path: string,
  message: string,
): boolean {
  if (result.success) {
    return false
  }
  return result.error.issues.some((issue) => issue.path[0] === path && issue.message === message)
}

// ---------------------------------------------------------------------------
// accessRequestFormSchema — tipo de usuário e e-mail condicional (ADR 0013)
// ---------------------------------------------------------------------------
describe('accessRequestFormSchema', () => {
  describe('userType', () => {
    it('should accept VISITOR and EMPLOYEE', () => {
      expect(accessRequestFormSchema.safeParse({ ...NEW_USER, userType: 'VISITOR' }).success).toBe(
        true,
      )
      expect(
        accessRequestFormSchema.safeParse({
          ...NEW_USER,
          userType: 'EMPLOYEE',
          driverEmail: 'colaboradora@somar.local',
        }).success,
      ).toBe(true)
    })

    it('should reject an unknown userType', () => {
      const result = accessRequestFormSchema.safeParse({ ...NEW_USER, userType: 'ADMIN' })

      expect(result.success).toBe(false)
    })
  })

  it('should reject a payload without userType', () => {
    const result = accessRequestFormSchema.safeParse(NEW_USER)

    expect(result.success).toBe(false)
  })

  describe('NEW_USER', () => {
    it('should accept a VISITOR without driver email', () => {
      const result = accessRequestFormSchema.safeParse({ ...NEW_USER, userType: 'VISITOR' })

      expect(result.success).toBe(true)
    })

    it('should require driver email for an EMPLOYEE', () => {
      const result = accessRequestFormSchema.safeParse({ ...NEW_USER, userType: 'EMPLOYEE' })

      expect(result.success).toBe(false)
      expect(hasIssue(result, 'driverEmail', 'form.errors.driver-email-required')).toBe(true)
    })

    it('should accept an EMPLOYEE with driver email', () => {
      const result = accessRequestFormSchema.safeParse({
        ...NEW_USER,
        userType: 'EMPLOYEE',
        driverEmail: 'colaboradora@somar.local',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('BOTH', () => {
    it('should accept a VISITOR without driver email', () => {
      const result = accessRequestFormSchema.safeParse({ ...BOTH, userType: 'VISITOR' })

      expect(result.success).toBe(true)
    })

    it('should require driver email for an EMPLOYEE', () => {
      const result = accessRequestFormSchema.safeParse({ ...BOTH, userType: 'EMPLOYEE' })

      expect(result.success).toBe(false)
      expect(hasIssue(result, 'driverEmail', 'form.errors.driver-email-required')).toBe(true)
    })
  })

  describe('cenários sem motorista', () => {
    it('should accept NEW_VEHICLE with EMPLOYEE and no driver data', () => {
      const result = accessRequestFormSchema.safeParse({
        ...NEW_VEHICLE,
        userType: 'EMPLOYEE',
      })

      expect(result.success).toBe(true)
    })

    it('should accept LINK with EMPLOYEE and no driver data', () => {
      const result = accessRequestFormSchema.safeParse({ ...LINK, userType: 'EMPLOYEE' })

      expect(result.success).toBe(true)
    })
  })
})
