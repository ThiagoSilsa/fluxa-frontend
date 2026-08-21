import { describe, expect, it } from 'vitest'
import { deviceFormSchema } from './device.schema'

describe('deviceFormSchema', () => {
  it('aceita valores válidos (criação)', () => {
    const result = deviceFormSchema.safeParse({
      name: 'Tablet Portaria 1',
      platform: 'ANDROID',
      entranceId: 'entrance-1',
      isActive: true,
    })
    expect(result.success).toBe(true)
  })

  it('aceita valores válidos sem portaria', () => {
    const result = deviceFormSchema.safeParse({
      name: 'Tablet',
      platform: 'IOS',
      entranceId: '',
      isActive: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = deviceFormSchema.safeParse({
      name: '',
      platform: 'ANDROID',
      isActive: true,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name')
    }
  })

  it('rejeita nome com mais de 100 caracteres', () => {
    const result = deviceFormSchema.safeParse({
      name: 'a'.repeat(101),
      platform: 'ANDROID',
      isActive: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita plataforma inválida', () => {
    const result = deviceFormSchema.safeParse({
      name: 'Tablet',
      platform: 'WINDOWS',
      isActive: true,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('platform')
    }
  })
})
