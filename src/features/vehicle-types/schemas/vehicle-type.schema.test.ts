import { describe, expect, it } from 'vitest'
import { vehicleTypeFormSchema } from './vehicle-type.schema'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MINIMAL_VALID = {
  code: 'FROTA',
  name: 'Frota',
  description: 'Veículos de frota',
  isFleet: true,
  isActive: true,
}

// ---------------------------------------------------------------------------
// vehicleTypeFormSchema — validação do formulário de tipo de veículo
// ---------------------------------------------------------------------------
describe('vehicleTypeFormSchema', () => {
  describe('code', () => {
    it('should accept a valid code', () => {
      const result = vehicleTypeFormSchema.safeParse(MINIMAL_VALID)

      expect(result.success).toBe(true)
    })

    it('should reject empty code', () => {
      const result = vehicleTypeFormSchema.safeParse({ ...MINIMAL_VALID, code: '' })

      expect(result.success).toBe(false)
    })

    it('should reject code longer than 50 characters', () => {
      const result = vehicleTypeFormSchema.safeParse({ ...MINIMAL_VALID, code: 'A'.repeat(51) })

      expect(result.success).toBe(false)
    })
  })

  describe('name', () => {
    it('should accept a valid name', () => {
      const result = vehicleTypeFormSchema.safeParse(MINIMAL_VALID)

      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const result = vehicleTypeFormSchema.safeParse({ ...MINIMAL_VALID, name: '' })

      expect(result.success).toBe(false)
    })

    it('should reject name longer than 100 characters', () => {
      const result = vehicleTypeFormSchema.safeParse({ ...MINIMAL_VALID, name: 'A'.repeat(101) })

      expect(result.success).toBe(false)
    })
  })

  describe('description', () => {
    it('should accept a valid description', () => {
      const result = vehicleTypeFormSchema.safeParse({
        ...MINIMAL_VALID,
        description: 'Descrição do tipo',
      })

      expect(result.success).toBe(true)
    })

    it('should accept empty description', () => {
      const result = vehicleTypeFormSchema.safeParse({ ...MINIMAL_VALID, description: '' })

      expect(result.success).toBe(true)
    })

    it('should accept undefined description', () => {
      const result = vehicleTypeFormSchema.safeParse({ ...MINIMAL_VALID, description: undefined })

      expect(result.success).toBe(true)
    })

    it('should reject description longer than 2000 characters', () => {
      const result = vehicleTypeFormSchema.safeParse({
        ...MINIMAL_VALID,
        description: 'A'.repeat(2001),
      })

      expect(result.success).toBe(false)
    })
  })

  describe('isFleet', () => {
    it('should accept true', () => {
      const result = vehicleTypeFormSchema.safeParse({ ...MINIMAL_VALID, isFleet: true })

      expect(result.success).toBe(true)
    })

    it('should accept false', () => {
      const result = vehicleTypeFormSchema.safeParse({ ...MINIMAL_VALID, isFleet: false })

      expect(result.success).toBe(true)
    })

    it('should reject missing isFleet', () => {
      const result = vehicleTypeFormSchema.safeParse({
        code: 'FROTA',
        name: 'Frota',
        description: '',
        isActive: true,
      })

      expect(result.success).toBe(false)
    })
  })

  describe('isActive', () => {
    it('should accept true', () => {
      const result = vehicleTypeFormSchema.safeParse({ ...MINIMAL_VALID, isActive: true })

      expect(result.success).toBe(true)
    })

    it('should accept false', () => {
      const result = vehicleTypeFormSchema.safeParse({ ...MINIMAL_VALID, isActive: false })

      expect(result.success).toBe(true)
    })

    it('should reject missing isActive', () => {
      const result = vehicleTypeFormSchema.safeParse({
        code: 'FROTA',
        name: 'Frota',
        description: '',
        isFleet: true,
      })

      expect(result.success).toBe(false)
    })
  })
})
