import { describe, expect, it } from 'vitest'
import {
  buildRoleListQuery,
  normalizeRoleFormDefaults,
  toCreateRolePayload,
  toUpdateRolePayload,
} from './role.mapper'

// ---------------------------------------------------------------------------
// normalizeRoleFormDefaults
// ---------------------------------------------------------------------------
describe('normalizeRoleFormDefaults', () => {
  it('should return default values when role is undefined', () => {
    const result = normalizeRoleFormDefaults()

    expect(result).toEqual({ name: '', description: '', isActive: true })
  })

  it('should map role entity values to form values', () => {
    const result = normalizeRoleFormDefaults({
      id: 'role-1',
      name: 'Analista',
      description: 'Cargo para analistas',
      isAdmin: false,
      isActive: true,
    })

    expect(result).toEqual({
      name: 'Analista',
      description: 'Cargo para analistas',
      isActive: true,
    })
  })

  it('should use empty string when optional fields are null', () => {
    const result = normalizeRoleFormDefaults({
      id: 'role-2',
      name: 'Agente',
      description: null,
      isAdmin: false,
      isActive: false,
    })

    expect(result).toEqual({ name: 'Agente', description: '', isActive: false })
  })
})

// ---------------------------------------------------------------------------
// toCreateRolePayload
// ---------------------------------------------------------------------------
describe('toCreateRolePayload', () => {
  it('should convert form values to create payload', () => {
    const result = toCreateRolePayload({
      name: '  Analista  ',
      description: '  Cargo para analistas  ',
      isActive: true,
    })

    expect(result).toEqual({
      name: 'Analista',
      description: 'Cargo para analistas',
    })
  })

  it('should convert empty description to null', () => {
    const result = toCreateRolePayload({ name: 'Analista', description: '', isActive: true })

    expect(result).toEqual({ name: 'Analista', description: null })
  })

  it('should convert whitespace-only description to null', () => {
    const result = toCreateRolePayload({ name: 'Analista', description: '   ', isActive: true })

    expect(result).toEqual({ name: 'Analista', description: null })
  })
})

// ---------------------------------------------------------------------------
// toUpdateRolePayload
// ---------------------------------------------------------------------------
describe('toUpdateRolePayload', () => {
  it('should convert form values to update payload', () => {
    const result = toUpdateRolePayload({
      name: '  Analista Sênior  ',
      description: '  Cargo atualizado  ',
      isActive: true,
    })

    expect(result).toEqual({
      name: 'Analista Sênior',
      description: 'Cargo atualizado',
      isActive: true,
    })
  })

  it('should convert empty description to null', () => {
    const result = toUpdateRolePayload({ name: 'Analista', description: '', isActive: false })

    expect(result).toEqual({ name: 'Analista', description: null, isActive: false })
  })

  it('should convert empty name to undefined', () => {
    const result = toUpdateRolePayload({ name: '', description: '', isActive: true })

    expect(result).toEqual({ name: undefined, description: null, isActive: true })
  })
})

// ---------------------------------------------------------------------------
// buildRoleListQuery
// ---------------------------------------------------------------------------
describe('buildRoleListQuery', () => {
  it('should return empty string when no params provided', () => {
    const result = buildRoleListQuery({})

    expect(result).toBe('')
  })

  it('should include search param when provided', () => {
    const result = buildRoleListQuery({ search: 'Analista' })

    expect(result).toContain('search=Analista')
  })

  it('should encode special characters in search', () => {
    const result = buildRoleListQuery({ search: 'João & Cia' })

    expect(result).toContain('Jo%C3%A3o')
    expect(result).toContain('Cia')
    expect(result).toContain('%26')
  })

  it('should include limit and offset when provided', () => {
    const result = buildRoleListQuery({ limit: 20, offset: 40 })

    expect(result).toContain('limit=20')
    expect(result).toContain('offset=40')
  })

  it('should combine search, limit and offset', () => {
    const result = buildRoleListQuery({ search: 'Analista', limit: 20, offset: 40 })

    expect(result).toContain('search=Analista')
    expect(result).toContain('limit=20')
    expect(result).toContain('offset=40')
  })
})
