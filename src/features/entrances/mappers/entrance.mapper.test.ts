import { describe, expect, it } from 'vitest'
import {
  buildEntranceListQuery,
  normalizeEntranceFormDefaults,
  toCreateEntrancePayload,
  toUpdateEntrancePayload,
} from './entrance.mapper'

// ---------------------------------------------------------------------------
// normalizeEntranceFormDefaults
// ---------------------------------------------------------------------------
describe('normalizeEntranceFormDefaults', () => {
  it('should return default values when entrance is undefined', () => {
    const result = normalizeEntranceFormDefaults()

    expect(result).toEqual({
      name: '',
      isActive: true,
    })
  })

  it('should map entrance entity values to form values', () => {
    const result = normalizeEntranceFormDefaults({
      id: 'ent-1',
      name: 'Portaria Principal',
      isActive: true,
    })

    expect(result).toEqual({
      name: 'Portaria Principal',
      isActive: true,
    })
  })

  it('should map inactive entrance', () => {
    const result = normalizeEntranceFormDefaults({
      id: 'ent-2',
      name: 'Portaria Secundária',
      isActive: false,
    })

    expect(result).toEqual({
      name: 'Portaria Secundária',
      isActive: false,
    })
  })
})

// ---------------------------------------------------------------------------
// toCreateEntrancePayload
// ---------------------------------------------------------------------------
describe('toCreateEntrancePayload', () => {
  it('should convert form values to create payload (name trimmed)', () => {
    const result = toCreateEntrancePayload({
      name: '  Portaria Principal  ',
      isActive: true,
    })

    expect(result).toEqual({
      name: 'Portaria Principal',
    })
  })

  it('should not send isActive on create (backend creates active)', () => {
    const result = toCreateEntrancePayload({
      name: 'Portaria Secundária',
      isActive: true,
    })

    expect(result).not.toHaveProperty('isActive')
  })
})

// ---------------------------------------------------------------------------
// toUpdateEntrancePayload
// ---------------------------------------------------------------------------
describe('toUpdateEntrancePayload', () => {
  const original = {
    name: 'Portaria Principal',
    isActive: true,
  }

  it('should return empty payload when nothing changed', () => {
    const result = toUpdateEntrancePayload({ ...original, name: ' Portaria Principal ' }, original)

    expect(result).toEqual({})
  })

  it('should include name when changed (trimmed)', () => {
    const result = toUpdateEntrancePayload({ ...original, name: '  Portaria Central  ' }, original)

    expect(result).toEqual({ name: 'Portaria Central' })
  })

  it('should include isActive when changed', () => {
    const result = toUpdateEntrancePayload({ ...original, isActive: false }, original)

    expect(result).toEqual({ isActive: false })
  })
})

// ---------------------------------------------------------------------------
// buildEntranceListQuery
// ---------------------------------------------------------------------------
describe('buildEntranceListQuery', () => {
  it('should return empty string when no params provided', () => {
    const result = buildEntranceListQuery({})

    expect(result).toBe('')
  })

  it('should include search param when provided', () => {
    const result = buildEntranceListQuery({ search: 'Principal' })

    expect(result).toContain('search=Principal')
  })

  it('should include isActive when provided', () => {
    const result = buildEntranceListQuery({ isActive: false })

    expect(result).toContain('isActive=false')
  })

  it('should include limit and offset when provided', () => {
    const result = buildEntranceListQuery({ limit: 20, offset: 40 })

    expect(result).toContain('limit=20')
    expect(result).toContain('offset=40')
  })

  it('should encode special characters in search', () => {
    const result = buildEntranceListQuery({ search: 'João & Cia' })

    expect(result).toContain('Jo%C3%A3o')
    expect(result).toContain('%26')
  })
})
