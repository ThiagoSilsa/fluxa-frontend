import { describe, expect, it } from 'vitest'
import {
  ACCEPT_PASSWORD_MAX_LENGTH,
  ACCEPT_PASSWORD_MIN_LENGTH,
  buildAcceptAccessRequestSchema,
} from './accept-access-request.schema'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMPTY = { vehicleTypeId: '', roleId: '', password: '' }

/** Verifica a mensagem (chave i18n) de um campo. */
function hasIssue(
  result: ReturnType<ReturnType<typeof buildAcceptAccessRequestSchema>['safeParse']>,
  path: string,
  message: string,
): boolean {
  if (result.success) {
    return false
  }
  return result.error.issues.some((issue) => issue.path[0] === path && issue.message === message)
}

// ---------------------------------------------------------------------------
// buildAcceptAccessRequestSchema
// ---------------------------------------------------------------------------
describe('buildAcceptAccessRequestSchema', () => {
  describe('sem exigências (LINK)', () => {
    it('should accept empty values', () => {
      const schema = buildAcceptAccessRequestSchema({
        needsVehicleType: false,
        needsEmployeeCredentials: false,
      })

      expect(schema.safeParse(EMPTY).success).toBe(true)
    })
  })

  describe('tipo do veículo (NEW_VEHICLE/BOTH)', () => {
    const schema = buildAcceptAccessRequestSchema({
      needsVehicleType: true,
      needsEmployeeCredentials: false,
    })

    it('should require the vehicle type', () => {
      const result = schema.safeParse(EMPTY)

      expect(result.success).toBe(false)
      expect(hasIssue(result, 'vehicleTypeId', 'form.errors.vehicle-type-required')).toBe(true)
    })

    it('should accept with the vehicle type filled', () => {
      expect(schema.safeParse({ ...EMPTY, vehicleTypeId: 'vt-1' }).success).toBe(true)
    })
  })

  describe('credenciais do Colaborador (userType EMPLOYEE)', () => {
    const schema = buildAcceptAccessRequestSchema({
      needsVehicleType: false,
      needsEmployeeCredentials: true,
    })

    it('should require role and password', () => {
      const result = schema.safeParse(EMPTY)

      expect(result.success).toBe(false)
      expect(hasIssue(result, 'roleId', 'form.errors.role-required')).toBe(true)
      expect(hasIssue(result, 'password', 'form.errors.password-required')).toBe(true)
    })

    it('should require a password with the minimum length', () => {
      const result = schema.safeParse({
        ...EMPTY,
        roleId: 'role-1',
        password: 'a'.repeat(ACCEPT_PASSWORD_MIN_LENGTH - 1),
      })

      expect(result.success).toBe(false)
      expect(hasIssue(result, 'password', 'form.errors.password-min')).toBe(true)
    })

    it('should reject a password longer than the maximum length', () => {
      const result = schema.safeParse({
        ...EMPTY,
        roleId: 'role-1',
        password: 'a'.repeat(ACCEPT_PASSWORD_MAX_LENGTH + 1),
      })

      expect(result.success).toBe(false)
      expect(hasIssue(result, 'password', 'form.errors.password-max')).toBe(true)
    })

    it('should accept role and password filled', () => {
      const result = schema.safeParse({ ...EMPTY, roleId: 'role-1', password: 'senha123' })

      expect(result.success).toBe(true)
    })

    it('should not require credentials for a VISITOR (schema sem a exigência)', () => {
      const visitorSchema = buildAcceptAccessRequestSchema({
        needsVehicleType: false,
        needsEmployeeCredentials: false,
      })

      expect(visitorSchema.safeParse(EMPTY).success).toBe(true)
    })
  })
})
