// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { APP_LANGUAGES, localeToLanguage, toLocaleTag } from './language.lib'

describe('APP_LANGUAGES', () => {
  it('lista os idiomas suportados', () => {
    expect(APP_LANGUAGES).toEqual(['pt', 'en', 'es'])
  })
})

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

  it('mapeia es para "es" (qualquer região)', () => {
    expect(localeToLanguage('es')).toBe('es')
    expect(localeToLanguage('es-ES')).toBe('es')
    expect(localeToLanguage('es-AR')).toBe('es')
    expect(localeToLanguage('es-MX')).toBe('es')
  })

  it('retorna null para idioma não suportado', () => {
    expect(localeToLanguage('fr')).toBeNull()
    expect(localeToLanguage('de-DE')).toBeNull()
  })

  it('ignora caixa alta', () => {
    expect(localeToLanguage('PT-BR')).toBe('pt')
    expect(localeToLanguage('EN')).toBe('en')
    expect(localeToLanguage('ES-AR')).toBe('es')
  })
})

describe('toLocaleTag', () => {
  it('devolve o locale do idioma, com a região de referência', () => {
    expect(toLocaleTag('pt')).toBe('pt-BR')
    expect(toLocaleTag('en-GB')).toBe('en-US')
    expect(toLocaleTag('es-AR')).toBe('es-ES')
  })

  it('idioma não suportado cai no locale do idioma de fallback', () => {
    // O texto cai no inglês (`fallbackLng`); a data segue o mesmo caminho.
    expect(toLocaleTag('fr')).toBe('en-US')
    expect(toLocaleTag(null)).toBe('en-US')
    expect(toLocaleTag(undefined)).toBe('en-US')
  })
})
