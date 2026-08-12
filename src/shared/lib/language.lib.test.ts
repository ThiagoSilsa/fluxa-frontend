// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { localeToLanguage } from './language.lib'

describe('localeToLanguage', () => {
  it('retorna null para valores vazios', () => {
    expect(localeToLanguage(null)).toBeNull()
    expect(localeToLanguage(undefined)).toBeNull()
    expect(localeToLanguage('')).toBeNull()
  })

  it('mapeia pt para "pt"', () => {
    expect(localeToLanguage('pt')).toBe('pt')
    expect(localeToLanguage('pt-BR')).toBe('pt')
    expect(localeToLanguage('pt-PT')).toBe('pt')
  })

  it('mapeia en para "en"', () => {
    expect(localeToLanguage('en')).toBe('en')
    expect(localeToLanguage('en-US')).toBe('en')
    expect(localeToLanguage('en-GB')).toBe('en')
  })

  it('retorna null para idioma não suportado', () => {
    expect(localeToLanguage('fr')).toBeNull()
    expect(localeToLanguage('es')).toBeNull()
  })

  it('ignora caixa alta', () => {
    expect(localeToLanguage('PT-BR')).toBe('pt')
    expect(localeToLanguage('EN')).toBe('en')
  })
})
