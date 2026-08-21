import { describe, expect, it } from 'vitest'
import {
  buildDepartmentListQuery,
  normalizeDepartmentFormDefaults,
  toCreateDepartmentPayload,
  toUpdateDepartmentPayload,
} from './department.mapper'

// ---------------------------------------------------------------------------
// normalizeDepartmentFormDefaults
// ---------------------------------------------------------------------------
describe('normalizeDepartmentFormDefaults', () => {
  it('should return default values when department is undefined', () => {
    const result = normalizeDepartmentFormDefaults()

    expect(result).toEqual({
      name: '',
      parkingSpace: 0,
      description: '',
      isActive: true,
    })
  })

  it('should map department entity values to form values', () => {
    const result = normalizeDepartmentFormDefaults({
      id: 'dept-1',
      name: 'Recepção',
      description: 'Recepção principal',
      parkingSpace: 30,
      isActive: true,
    })

    expect(result).toEqual({
      name: 'Recepção',
      parkingSpace: 30,
      description: 'Recepção principal',
      isActive: true,
    })
  })

  it('should use empty string when description is null', () => {
    const result = normalizeDepartmentFormDefaults({
      id: 'dept-2',
      name: 'Estacionamento',
      description: null,
      parkingSpace: 0,
      isActive: false,
    })

    expect(result).toEqual({
      name: 'Estacionamento',
      parkingSpace: 0,
      description: '',
      isActive: false,
    })
  })
})

// ---------------------------------------------------------------------------
// toCreateDepartmentPayload
// ---------------------------------------------------------------------------
describe('toCreateDepartmentPayload', () => {
  it('should convert form values to create payload (name trimmed)', () => {
    const result = toCreateDepartmentPayload({
      name: '  Recepção  ',
      parkingSpace: 30,
      description: '  Recepção principal  ',
      isActive: true,
    })

    expect(result).toEqual({
      name: 'Recepção',
      parkingSpace: 30,
      description: 'Recepção principal',
    })
  })

  it('should not send isActive on create (backend creates active)', () => {
    const result = toCreateDepartmentPayload({
      name: 'Estacionamento',
      parkingSpace: 0,
      description: '',
      isActive: true,
    })

    expect(result).not.toHaveProperty('isActive')
  })

  it('should convert empty description to null', () => {
    const result = toCreateDepartmentPayload({
      name: 'Estacionamento',
      parkingSpace: 0,
      description: '',
      isActive: true,
    })

    expect(result.description).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// toUpdateDepartmentPayload
// ---------------------------------------------------------------------------
describe('toUpdateDepartmentPayload', () => {
  const original = {
    name: 'Recepção',
    parkingSpace: 30,
    description: 'Recepção principal',
    isActive: true,
  }

  it('should return empty payload when nothing changed', () => {
    const result = toUpdateDepartmentPayload(
      { ...original, name: ' Recepção ', description: 'Recepção principal' },
      original,
    )

    expect(result).toEqual({})
  })

  it('should include name when changed (trimmed)', () => {
    const result = toUpdateDepartmentPayload({ ...original, name: '  Recepção 2 ' }, original)

    expect(result).toEqual({ name: 'Recepção 2' })
  })

  it('should include parkingSpace when changed', () => {
    const result = toUpdateDepartmentPayload({ ...original, parkingSpace: 45 }, original)

    expect(result).toEqual({ parkingSpace: 45 })
  })

  it('should include isActive when changed', () => {
    const result = toUpdateDepartmentPayload({ ...original, isActive: false }, original)

    expect(result).toEqual({ isActive: false })
  })

  it('should convert empty description to null when cleared', () => {
    const result = toUpdateDepartmentPayload({ ...original, description: '' }, original)

    expect(result).toEqual({ description: null })
  })
})

// ---------------------------------------------------------------------------
// buildDepartmentListQuery
// ---------------------------------------------------------------------------
describe('buildDepartmentListQuery', () => {
  it('should return empty string when no params provided', () => {
    const result = buildDepartmentListQuery({})

    expect(result).toBe('')
  })

  it('should include search param when provided', () => {
    const result = buildDepartmentListQuery({ search: 'Recep' })

    expect(result).toContain('search=Recep')
  })

  it('should include isActive when provided', () => {
    const result = buildDepartmentListQuery({ isActive: false })

    expect(result).toContain('isActive=false')
  })

  it('should include limit and offset when provided', () => {
    const result = buildDepartmentListQuery({ limit: 20, offset: 40 })

    expect(result).toContain('limit=20')
    expect(result).toContain('offset=40')
  })

  it('should encode special characters in search', () => {
    const result = buildDepartmentListQuery({ search: 'João & Cia' })

    expect(result).toContain('Jo%C3%A3o')
    expect(result).toContain('%26')
  })
})
