import { describe, expect, it } from 'vitest'
import { departmentFormSchema } from './department.schema'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MINIMAL_VALID = {
  name: 'Recepção',
  parkingSpace: 30,
  description: 'Recepção principal',
  isActive: true,
}

// ---------------------------------------------------------------------------
// departmentFormSchema — validação do formulário de departamento
// ---------------------------------------------------------------------------
describe('departmentFormSchema', () => {
  describe('name', () => {
    it('should accept a valid name', () => {
      const result = departmentFormSchema.safeParse(MINIMAL_VALID)

      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const result = departmentFormSchema.safeParse({ ...MINIMAL_VALID, name: '' })

      expect(result.success).toBe(false)
    })

    it('should reject name longer than 100 characters', () => {
      const result = departmentFormSchema.safeParse({ ...MINIMAL_VALID, name: 'A'.repeat(101) })

      expect(result.success).toBe(false)
    })
  })

  describe('parkingSpace', () => {
    it('should accept a valid number', () => {
      const result = departmentFormSchema.safeParse(MINIMAL_VALID)

      expect(result.success).toBe(true)
    })

    it('should accept zero (department without parking spaces)', () => {
      const result = departmentFormSchema.safeParse({ ...MINIMAL_VALID, parkingSpace: 0 })

      expect(result.success).toBe(true)
    })

    it('should reject empty parkingSpace', () => {
      const result = departmentFormSchema.safeParse({ ...MINIMAL_VALID, parkingSpace: '' })

      expect(result.success).toBe(false)
    })

    it('should reject missing parkingSpace', () => {
      const result = departmentFormSchema.safeParse({
        name: 'Recepção',
        description: '',
        isActive: true,
      })

      expect(result.success).toBe(false)
    })

    it('should reject negative parkingSpace', () => {
      const result = departmentFormSchema.safeParse({ ...MINIMAL_VALID, parkingSpace: -1 })

      expect(result.success).toBe(false)
    })

    it('should reject non-integer parkingSpace', () => {
      const result = departmentFormSchema.safeParse({ ...MINIMAL_VALID, parkingSpace: 1.5 })

      expect(result.success).toBe(false)
    })

    it('should reject non-numeric values', () => {
      const result = departmentFormSchema.safeParse({ ...MINIMAL_VALID, parkingSpace: '15' })

      expect(result.success).toBe(false)
    })
  })

  describe('description', () => {
    it('should accept a valid description', () => {
      const result = departmentFormSchema.safeParse({
        ...MINIMAL_VALID,
        description: 'Descrição do departamento',
      })

      expect(result.success).toBe(true)
    })

    it('should accept empty description', () => {
      const result = departmentFormSchema.safeParse({ ...MINIMAL_VALID, description: '' })

      expect(result.success).toBe(true)
    })

    it('should accept undefined description', () => {
      const result = departmentFormSchema.safeParse({ ...MINIMAL_VALID, description: undefined })

      expect(result.success).toBe(true)
    })

    it('should reject description longer than 2000 characters', () => {
      const result = departmentFormSchema.safeParse({
        ...MINIMAL_VALID,
        description: 'A'.repeat(2001),
      })

      expect(result.success).toBe(false)
    })
  })

  describe('isActive', () => {
    it('should accept true', () => {
      const result = departmentFormSchema.safeParse({ ...MINIMAL_VALID, isActive: true })

      expect(result.success).toBe(true)
    })

    it('should accept false', () => {
      const result = departmentFormSchema.safeParse({ ...MINIMAL_VALID, isActive: false })

      expect(result.success).toBe(true)
    })

    it('should reject missing isActive', () => {
      const result = departmentFormSchema.safeParse({
        name: 'Recepção',
        parkingSpace: 30,
        description: '',
      })

      expect(result.success).toBe(false)
    })
  })
})
