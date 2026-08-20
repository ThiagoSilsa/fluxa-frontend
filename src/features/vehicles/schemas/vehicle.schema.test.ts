import { describe, expect, it } from 'vitest'
import { vehicleFormSchema } from './vehicle.schema'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MINIMAL_VALID = {
  plate: 'ABC1D23',
  vehicleTypeId: 'type-1',
  model: '',
  color: '',
  observation: '',
  departmentId: '',
  freePass: false,
  isActive: true,
}

// ---------------------------------------------------------------------------
// vehicleFormSchema — validação do formulário de veículo
// ---------------------------------------------------------------------------
describe('vehicleFormSchema', () => {
  describe('plate', () => {
    it('should accept a valid Mercosul plate', () => {
      const result = vehicleFormSchema.safeParse(MINIMAL_VALID)
      expect(result.success).toBe(true)
    })

    it('should accept a valid old-format plate', () => {
      const result = vehicleFormSchema.safeParse({ ...MINIMAL_VALID, plate: 'ABC1234' })
      expect(result.success).toBe(true)
    })

    it('should reject empty plate', () => {
      const result = vehicleFormSchema.safeParse({ ...MINIMAL_VALID, plate: '' })
      expect(result.success).toBe(false)
    })

    it('should reject invalid plate format', () => {
      const result = vehicleFormSchema.safeParse({ ...MINIMAL_VALID, plate: 'ABC12' })
      expect(result.success).toBe(false)
    })

    it('should reject plate with invalid chars', () => {
      const result = vehicleFormSchema.safeParse({ ...MINIMAL_VALID, plate: 'ABC1D2!' })
      expect(result.success).toBe(false)
    })
  })

  describe('vehicleTypeId', () => {
    it('should accept a valid type', () => {
      const result = vehicleFormSchema.safeParse(MINIMAL_VALID)
      expect(result.success).toBe(true)
    })

    it('should reject missing type', () => {
      const result = vehicleFormSchema.safeParse({
        plate: 'ABC1D23',
        vehicleTypeId: '',
        freePass: false,
        isActive: true,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('optional fields', () => {
    it('should accept model, color, observation and department', () => {
      const result = vehicleFormSchema.safeParse({
        ...MINIMAL_VALID,
        model: 'Onix',
        color: 'Prata',
        observation: 'Observação',
        departmentId: 'dept-1',
      })
      expect(result.success).toBe(true)
    })

    it('should reject model longer than 100', () => {
      const result = vehicleFormSchema.safeParse({ ...MINIMAL_VALID, model: 'A'.repeat(101) })
      expect(result.success).toBe(false)
    })

    it('should reject color longer than 50', () => {
      const result = vehicleFormSchema.safeParse({ ...MINIMAL_VALID, color: 'A'.repeat(51) })
      expect(result.success).toBe(false)
    })

    it('should reject observation longer than 2000', () => {
      const result = vehicleFormSchema.safeParse({
        ...MINIMAL_VALID,
        observation: 'A'.repeat(2001),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('freePass / isActive', () => {
    it('should accept freePass true/false', () => {
      expect(vehicleFormSchema.safeParse({ ...MINIMAL_VALID, freePass: true }).success).toBe(true)
      expect(vehicleFormSchema.safeParse({ ...MINIMAL_VALID, freePass: false }).success).toBe(true)
    })

    it('should accept isActive true/false', () => {
      expect(vehicleFormSchema.safeParse({ ...MINIMAL_VALID, isActive: true }).success).toBe(true)
      expect(vehicleFormSchema.safeParse({ ...MINIMAL_VALID, isActive: false }).success).toBe(true)
    })

    it('should reject missing freePass', () => {
      const result = vehicleFormSchema.safeParse({
        plate: 'ABC1D23',
        vehicleTypeId: 'type-1',
        isActive: true,
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing isActive', () => {
      const result = vehicleFormSchema.safeParse({
        plate: 'ABC1D23',
        vehicleTypeId: 'type-1',
        freePass: false,
      })
      expect(result.success).toBe(false)
    })
  })
})
