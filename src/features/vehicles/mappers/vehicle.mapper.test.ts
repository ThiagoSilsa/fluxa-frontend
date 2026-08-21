import { describe, expect, it } from 'vitest'
import {
  buildVehicleListQuery,
  normalizeVehicleFormDefaults,
  toCreateVehiclePayload,
  toUpdateVehiclePayload,
} from './vehicle.mapper'

// Utils
import { isValidBrazilianPlate, normalizePlate } from '../utils/plate'

// ---------------------------------------------------------------------------
// normalizePlate / isValidBrazilianPlate
// ---------------------------------------------------------------------------
describe('plate utils', () => {
  it('should normalize trim, uppercase and remove hyphens/spaces', () => {
    expect(normalizePlate(' abc-1d23 ')).toBe('ABC1D23')
    expect(normalizePlate('abc 1234')).toBe('ABC1234')
  })

  it('should validate Brazilian formats', () => {
    expect(isValidBrazilianPlate('ABC1D23')).toBe(true)
    expect(isValidBrazilianPlate('ABC1234')).toBe(true)
    expect(isValidBrazilianPlate('ABC12')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// normalizeVehicleFormDefaults
// ---------------------------------------------------------------------------
describe('normalizeVehicleFormDefaults', () => {
  it('should return default values when vehicle is undefined', () => {
    const result = normalizeVehicleFormDefaults()

    expect(result).toEqual({
      plate: '',
      vehicleTypeId: '',
      model: '',
      color: '',
      observation: '',
      departmentId: '',
      freePass: false,
      isActive: true,
    })
  })

  it('should map vehicle entity values to form values', () => {
    const result = normalizeVehicleFormDefaults({
      id: 'v-1',
      plate: 'ABC1D23',
      model: 'Onix',
      color: 'Prata',
      observation: null,
      isBlocked: false,
      freePass: true,
      vehicleTypeId: 'type-1',
      vehicleType: null,
      isActive: true,
      createdAt: '2026-08-15T00:00:00.000Z',
    })

    expect(result).toEqual({
      plate: 'ABC1D23',
      vehicleTypeId: 'type-1',
      model: 'Onix',
      color: 'Prata',
      observation: '',
      departmentId: '',
      freePass: true,
      isActive: true,
    })
  })

  it('should use currentDepartmentId when provided', () => {
    const result = normalizeVehicleFormDefaults(undefined, 'dept-1')
    expect(result.departmentId).toBe('dept-1')
  })
})

// ---------------------------------------------------------------------------
// toCreateVehiclePayload
// ---------------------------------------------------------------------------
describe('toCreateVehiclePayload', () => {
  it('should normalize plate and trim optional fields', () => {
    const result = toCreateVehiclePayload({
      plate: ' abc-1d23 ',
      vehicleTypeId: 'type-1',
      model: '  Onix  ',
      color: ' Prata ',
      observation: '  Obs  ',
      departmentId: 'dept-1',
      freePass: true,
      isActive: true,
    })

    expect(result).toEqual({
      plate: 'ABC1D23',
      vehicleTypeId: 'type-1',
      model: 'Onix',
      color: 'Prata',
      observation: 'Obs',
      freePass: true,
    })
  })

  it('should convert empty optionals to null and not send isActive/departmentId', () => {
    const result = toCreateVehiclePayload({
      plate: 'ABC1234',
      vehicleTypeId: 'type-1',
      model: '',
      color: '',
      observation: '',
      departmentId: 'dept-1',
      freePass: false,
      isActive: true,
    })

    expect(result).not.toHaveProperty('isActive')
    expect(result).not.toHaveProperty('departmentId')
    expect(result.model).toBeNull()
    expect(result.color).toBeNull()
    expect(result.observation).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// toUpdateVehiclePayload
// ---------------------------------------------------------------------------
describe('toUpdateVehiclePayload', () => {
  const original = {
    plate: 'ABC1D23',
    vehicleTypeId: 'type-1',
    model: 'Onix',
    color: 'Prata',
    observation: 'Obs',
    departmentId: '',
    freePass: false,
    isActive: true,
  }

  it('should return empty payload when nothing changed', () => {
    const result = toUpdateVehiclePayload(
      { ...original, plate: 'abc-1d23', model: 'Onix' },
      original,
    )
    expect(result).toEqual({})
  })

  it('should include changed fields (plate normalized)', () => {
    const result = toUpdateVehiclePayload({ ...original, plate: ' ABC1D24 ' }, original)
    expect(result).toEqual({ plate: 'ABC1D24' })
  })

  it('should include type, freePass and isActive when changed', () => {
    const result = toUpdateVehiclePayload(
      { ...original, vehicleTypeId: 'type-2', freePass: true, isActive: false },
      original,
    )
    expect(result).toEqual({ vehicleTypeId: 'type-2', freePass: true, isActive: false })
  })

  it('should clear description to null when emptied', () => {
    const result = toUpdateVehiclePayload({ ...original, observation: '' }, original)
    expect(result).toEqual({ observation: null })
  })

  it('should not include departmentId (managed by handlers)', () => {
    const result = toUpdateVehiclePayload({ ...original, departmentId: 'dept-1' }, original)
    expect(result).not.toHaveProperty('departmentId')
  })
})

// ---------------------------------------------------------------------------
// buildVehicleListQuery
// ---------------------------------------------------------------------------
describe('buildVehicleListQuery', () => {
  it('should return empty string when no params provided', () => {
    expect(buildVehicleListQuery({})).toBe('')
  })

  it('should include search, filters, sort and pagination', () => {
    const result = buildVehicleListQuery({
      search: 'ABC',
      vehicleTypeId: 'type-1',
      departmentId: 'dept-1',
      freePass: true,
      isActive: false,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      limit: 20,
      offset: 40,
    })

    expect(result).toContain('search=ABC')
    expect(result).toContain('vehicleTypeId=type-1')
    expect(result).toContain('departmentId=dept-1')
    expect(result).toContain('freePass=true')
    expect(result).toContain('isActive=false')
    expect(result).toContain('sortBy=createdAt')
    expect(result).toContain('sortOrder=DESC')
    expect(result).toContain('limit=20')
    expect(result).toContain('offset=40')
  })
})
