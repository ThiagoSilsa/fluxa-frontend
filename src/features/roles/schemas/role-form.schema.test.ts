import { describe, expect, it } from 'vitest'
import { roleFormSchema } from './role-form.schema'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MINIMAL_VALID = {
  name: 'Analista',
  description: 'Cargo para analistas',
}

// ---------------------------------------------------------------------------
// roleFormSchema — validação do formulário de cargo
// ---------------------------------------------------------------------------
describe('roleFormSchema', () => {
  describe('name', () => {
    it('should accept a valid name', () => {
      const result = roleFormSchema.safeParse(MINIMAL_VALID)

      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const result = roleFormSchema.safeParse({ ...MINIMAL_VALID, name: '' })

      expect(result.success).toBe(false)
    })

    it('should reject name with 1 character', () => {
      const result = roleFormSchema.safeParse({ ...MINIMAL_VALID, name: 'A' })

      expect(result.success).toBe(false)
    })

    it('should reject name longer than 255 characters', () => {
      const result = roleFormSchema.safeParse({ ...MINIMAL_VALID, name: 'A'.repeat(256) })

      expect(result.success).toBe(false)
    })
  })

  describe('description', () => {
    it('should accept a valid description', () => {
      const result = roleFormSchema.safeParse({
        ...MINIMAL_VALID,
        description: 'Descrição do cargo',
      })

      expect(result.success).toBe(true)
    })

    it('should accept empty description', () => {
      const result = roleFormSchema.safeParse({ ...MINIMAL_VALID, description: '' })

      expect(result.success).toBe(true)
    })

    it('should accept undefined description', () => {
      const result = roleFormSchema.safeParse({ ...MINIMAL_VALID, description: undefined })

      expect(result.success).toBe(true)
    })

    it('should reject description longer than 500 characters', () => {
      const result = roleFormSchema.safeParse({
        ...MINIMAL_VALID,
        description: 'A'.repeat(501),
      })

      expect(result.success).toBe(false)
    })
  })
})
