import { describe, expect, it } from 'vitest'
import { formatDateTime, getEntryDenialReasonKey } from './access.lib'

describe('getEntryDenialReasonKey', () => {
  it('mapeia cada motivo para a chave do namespace access', () => {
    expect(getEntryDenialReasonKey('BLOCKED')).toBe('denial.reasons.BLOCKED')
    expect(getEntryDenialReasonKey('UNREGISTERED')).toBe('denial.reasons.UNREGISTERED')
    expect(getEntryDenialReasonKey('UNAUTHORIZED_DRIVER')).toBe(
      'denial.reasons.UNAUTHORIZED_DRIVER',
    )
    expect(getEntryDenialReasonKey('OTHER')).toBe('denial.reasons.OTHER')
  })
})

describe('formatDateTime', () => {
  it('formata um instante ISO em data/hora local', () => {
    const result = formatDateTime('2026-08-21T14:30:00.000Z')
    // O separador data/hora varia por ambiente/ICU (espaço, vírgula ou ambos).
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}[, ]+\d{2}:\d{2}/)
  })

  it('devolve traço para null/undefined', () => {
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime(undefined)).toBe('—')
  })

  it('devolve traço para data inválida', () => {
    expect(formatDateTime('data-invalida')).toBe('—')
  })
})
