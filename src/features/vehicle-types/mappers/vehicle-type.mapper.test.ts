import { describe, expect, it } from 'vitest'
import {
  buildVehicleTypeListQuery,
  normalizeVehicleTypeCode,
  normalizeVehicleTypeFormDefaults,
  toCreateVehicleTypePayload,
  toUpdateVehicleTypePayload,
} from './vehicle-type.mapper'

// ---------------------------------------------------------------------------
// normalizeVehicleTypeFormDefaults
// ---------------------------------------------------------------------------
describe('normalizeVehicleTypeFormDefaults', () => {
  it('should return default values when vehicleType is undefined', () => {
    const result = normalizeVehicleTypeFormDefaults()

    expect(result).toEqual({
      code: '',
      name: '',
      description: '',
      isFleet: false,
      isActive: true,
    })
  })

  it('should map vehicle type entity values to form values', () => {
    const result = normalizeVehicleTypeFormDefaults({
      id: 'type-1',
      code: 'FROTA',
      name: 'Frota',
      description: 'Veículos de frota',
      isFleet: true,
      isActive: true,
    })

    expect(result).toEqual({
      code: 'FROTA',
      name: 'Frota',
      description: 'Veículos de frota',
      isFleet: true,
      isActive: true,
    })
  })

  it('should use empty string when optional fields are null', () => {
    const result = normalizeVehicleTypeFormDefaults({
      id: 'type-2',
      code: 'PARTICULAR',
      name: 'Particular',
      description: null,
      isFleet: false,
      isActive: false,
    })

    expect(result).toEqual({
      code: 'PARTICULAR',
      name: 'Particular',
      description: '',
      isFleet: false,
      isActive: false,
    })
  })
})

// ---------------------------------------------------------------------------
// normalizeVehicleTypeCode
// ---------------------------------------------------------------------------
describe('normalizeVehicleTypeCode', () => {
  it('should trim and uppercase the code', () => {
    expect(normalizeVehicleTypeCode('  utilitario ')).toBe('UTILITARIO')
  })
})

// ---------------------------------------------------------------------------
// toCreateVehicleTypePayload
// ---------------------------------------------------------------------------
describe('toCreateVehicleTypePayload', () => {
  it('should convert form values to create payload (code normalized)', () => {
    const result = toCreateVehicleTypePayload({
      code: '  utilitario ',
      name: '  Utilitário  ',
      description: '  Veículos utilitários  ',
      isFleet: true,
      isActive: true,
    })

    expect(result).toEqual({
      code: 'UTILITARIO',
      name: 'Utilitário',
      description: 'Veículos utilitários',
      isFleet: true,
    })
  })

  it('should not send isActive on create (backend creates active)', () => {
    const result = toCreateVehicleTypePayload({
      code: 'VISITANTE',
      name: 'Visitante',
      description: '',
      isFleet: false,
      isActive: true,
    })

    expect(result).not.toHaveProperty('isActive')
  })

  it('should convert empty description to null', () => {
    const result = toCreateVehicleTypePayload({
      code: 'VISITANTE',
      name: 'Visitante',
      description: '',
      isFleet: false,
      isActive: true,
    })

    expect(result.description).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// toUpdateVehicleTypePayload
// ---------------------------------------------------------------------------
describe('toUpdateVehicleTypePayload', () => {
  const original = {
    code: 'FROTA',
    name: 'Frota',
    description: 'Veículos de frota',
    isFleet: true,
    isActive: true,
  }

  it('should return empty payload when nothing changed', () => {
    const result = toUpdateVehicleTypePayload(
      { ...original, code: ' frota ', description: 'Veículos de frota' },
      original,
    )

    expect(result).toEqual({})
  })

  it('should include changed fields (code normalized)', () => {
    const result = toUpdateVehicleTypePayload({ ...original, code: '  frota-2 ' }, original)

    expect(result).toEqual({ code: 'FROTA-2' })
  })

  it('should include isFleet and isActive when changed', () => {
    const result = toUpdateVehicleTypePayload(
      { ...original, isFleet: false, isActive: false },
      original,
    )

    expect(result).toEqual({ isFleet: false, isActive: false })
  })

  it('should convert empty description to null when cleared', () => {
    const result = toUpdateVehicleTypePayload({ ...original, description: '' }, original)

    expect(result).toEqual({ description: null })
  })
})

// ---------------------------------------------------------------------------
// buildVehicleTypeListQuery
// ---------------------------------------------------------------------------
describe('buildVehicleTypeListQuery', () => {
  it('should return empty string when no params provided', () => {
    const result = buildVehicleTypeListQuery({})

    expect(result).toBe('')
  })

  it('should include search param when provided', () => {
    const result = buildVehicleTypeListQuery({ search: 'FRO' })

    expect(result).toContain('search=FRO')
  })

  it('should include isFleet when provided', () => {
    const result = buildVehicleTypeListQuery({ isFleet: true })

    expect(result).toContain('isFleet=true')
  })

  it('should include isActive when provided', () => {
    const result = buildVehicleTypeListQuery({ isActive: false })

    expect(result).toContain('isActive=false')
  })

  it('should include limit and offset when provided', () => {
    const result = buildVehicleTypeListQuery({ limit: 20, offset: 40 })

    expect(result).toContain('limit=20')
    expect(result).toContain('offset=40')
  })

  it('should encode special characters in search', () => {
    const result = buildVehicleTypeListQuery({ search: 'João & Cia' })

    expect(result).toContain('Jo%C3%A3o')
    expect(result).toContain('%26')
  })
})
