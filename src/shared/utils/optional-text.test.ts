import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { optionalText } from './optional-text'

describe('optionalText', () => {
  const schema = z.object({
    description: optionalText(z.string().max(5)),
  })

  it('aceita campo ausente como undefined', () => {
    const result = schema.parse({})
    expect(result.description).toBeUndefined()
  })

  it('aceita string vazia', () => {
    const result = schema.parse({ description: '' })
    expect(result.description).toBe('')
  })

  it('aceita string válida', () => {
    const result = schema.parse({ description: 'abc' })
    expect(result.description).toBe('abc')
  })

  it('rejeita string acima do limite', () => {
    expect(() => schema.parse({ description: 'abcdef' })).toThrow()
  })

  it('rejeita valor não-string', () => {
    expect(() => schema.parse({ description: 123 })).toThrow()
  })
})
