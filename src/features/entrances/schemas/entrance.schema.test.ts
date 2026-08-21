import { describe, expect, it } from 'vitest'
import { entranceFormSchema } from './entrance.schema'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MINIMAL_VALID = {
  name: 'Portaria Principal',
  isActive: true,
}

// ---------------------------------------------------------------------------
// entranceFormSchema — validação do formulário de portaria
// ---------------------------------------------------------------------------
describe('entranceFormSchema', () => {
  describe('name', () => {
    it('should accept a valid name', () => {
      const result = entranceFormSchema.safeParse(MINIMAL_VALID)

      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const result = entranceFormSchema.safeParse({ ...MINIMAL_VALID, name: '' })

      expect(result.success).toBe(false)
    })

    it('should reject name longer than 100 characters', () => {
      const result = entranceFormSchema.safeParse({ ...MINIMAL_VALID, name: 'A'.repeat(101) })

      expect(result.success).toBe(false)
    })
  })

  describe('isActive', () => {
    it('should accept true', () => {
      const result = entranceFormSchema.safeParse({ ...MINIMAL_VALID, isActive: true })

      expect(result.success).toBe(true)
    })

    it('should accept false', () => {
      const result = entranceFormSchema.safeParse({ ...MINIMAL_VALID, isActive: false })

      expect(result.success).toBe(true)
    })

    it('should reject missing isActive', () => {
      const result = entranceFormSchema.safeParse({ name: 'Portaria Principal' })

      expect(result.success).toBe(false)
    })
  })
})
