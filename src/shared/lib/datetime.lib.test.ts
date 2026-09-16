// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { formatDateTime, getActiveLocale } from './datetime.lib'

/** Instante de referência (21/08/2026). */
const ISO = '2026-08-21T14:30:00.000Z'

describe('formatDateTime', () => {
  it('formata um instante ISO em data/hora local', () => {
    // O separador data/hora varia por ambiente/ICU (espaço, vírgula ou ambos).
    expect(formatDateTime(ISO, 'pt-BR')).toMatch(/\d{2}\/\d{2}\/\d{4}[, ]+\d{2}:\d{2}/)
  })

  it('usa o locale pedido — o mesmo instante sai no formato de cada idioma', () => {
    // Dia antes do mês em pt/es; mês antes do dia em en. É o que prova que o
    // locale chega ao `Intl`, e não só que a data sai formatada.
    expect(formatDateTime(ISO, 'pt-BR')).toMatch(/^21\/08\/2026/)
    expect(formatDateTime(ISO, 'es-ES')).toMatch(/^21\/08\/2026/)
    expect(formatDateTime(ISO, 'en-US')).toMatch(/^08\/21\/2026/)
  })

  it('sem locale, formata no idioma em uso na interface', () => {
    expect(formatDateTime(ISO)).toBe(formatDateTime(ISO, getActiveLocale()))
  })

  it('devolve traço para null/undefined', () => {
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime(undefined)).toBe('—')
  })

  it('devolve traço para data inválida', () => {
    expect(formatDateTime('data-invalida')).toBe('—')
  })
})

describe('getActiveLocale', () => {
  it('devolve um locale de formatação conhecido', () => {
    expect(['pt-BR', 'en-US', 'es-ES']).toContain(getActiveLocale())
  })
})
