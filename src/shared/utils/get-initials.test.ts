// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { getInitials } from './get-initials'

describe('getInitials', () => {
  it('devolve as iniciais da primeira e da última palavra', () => {
    expect(getInitials('João da Silva')).toBe('JS')
  })

  it('devolve a inicial de nome com uma palavra só', () => {
    expect(getInitials('Ana')).toBe('A')
  })

  it('ignora espaços extras', () => {
    expect(getInitials('  Maria  Clara  ')).toBe('MC')
  })

  it('devolve string vazia para nome vazio ou só espaços', () => {
    expect(getInitials('')).toBe('')
    expect(getInitials('   ')).toBe('')
  })
})
