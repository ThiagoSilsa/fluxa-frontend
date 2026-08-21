import { describe, expect, it } from 'vitest'
import {
  formatDateTime,
  getBlockRequestStatusLabelKey,
  getBlockStatusLabelKey,
  getBlockTypeLabelKey,
} from './block.lib'

describe('getBlockStatusLabelKey', () => {
  it('mapeia os status de bloqueio', () => {
    expect(getBlockStatusLabelKey('ACTIVE')).toBe('blockStatus.ACTIVE')
    expect(getBlockStatusLabelKey('REVOKED')).toBe('blockStatus.REVOKED')
  })
})

describe('getBlockTypeLabelKey', () => {
  it('mapeia os tipos de bloqueio', () => {
    expect(getBlockTypeLabelKey('MANUAL')).toBe('blockType.MANUAL')
    expect(getBlockTypeLabelKey('AUTOMATIC')).toBe('blockType.AUTOMATIC')
  })
})

describe('getBlockRequestStatusLabelKey', () => {
  it('mapeia os status de solicitação', () => {
    expect(getBlockRequestStatusLabelKey('PENDING')).toBe('requestStatus.PENDING')
    expect(getBlockRequestStatusLabelKey('APPROVED')).toBe('requestStatus.APPROVED')
    expect(getBlockRequestStatusLabelKey('REJECTED')).toBe('requestStatus.REJECTED')
    expect(getBlockRequestStatusLabelKey('CANCELLED')).toBe('requestStatus.CANCELLED')
  })
})

describe('formatDateTime', () => {
  it('formata um instante ISO em data/hora local', () => {
    // O separador data/hora varia por ambiente/ICU (espaço, vírgula ou ambos).
    expect(formatDateTime('2026-08-21T14:30:00.000Z')).toMatch(
      /\d{2}\/\d{2}\/\d{4}[, ]+\d{2}:\d{2}/,
    )
  })

  it('devolve traço para null/undefined', () => {
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime(undefined)).toBe('—')
  })
})
