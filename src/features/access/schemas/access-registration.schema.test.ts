import { describe, expect, it } from 'vitest'

// Schema
import {
  DEFAULT_REGISTRATION_VALUES,
  createAccessRegistrationSchema,
} from './access-registration.schema'

/** Valida os valores no cenário e devolve os caminhos com erro. */
function validate(type: Parameters<typeof createAccessRegistrationSchema>[0], values: object) {
  const result = createAccessRegistrationSchema(type).safeParse({
    ...DEFAULT_REGISTRATION_VALUES,
    ...values,
  })

  if (result.success) {
    return []
  }
  return result.error.issues.map((issue) => issue.path.join('.'))
}

describe('createAccessRegistrationSchema', () => {
  it('LINK não exige nada (veículo e condutor já existem — regra 43)', () => {
    expect(validate('LINK', {})).toEqual([])
  })

  it('NEW_USER exige nome do condutor e telefone de contato', () => {
    expect(validate('NEW_USER', {})).toEqual(['driverName', 'contactPhone'])
    expect(validate('NEW_USER', { driverName: 'Marina', contactPhone: '11999999999' })).toEqual([])
  })

  it('NEW_USER Colaborador exige e-mail (ADR 0013)', () => {
    expect(
      validate('NEW_USER', {
        userType: 'EMPLOYEE',
        driverName: 'Marina',
        contactPhone: '11999999999',
      }),
    ).toEqual(['driverEmail'])
  })

  it('rejeita e-mail inválido', () => {
    expect(
      validate('NEW_USER', {
        userType: 'EMPLOYEE',
        driverName: 'Marina',
        driverEmail: 'marina-arroba',
        contactPhone: '11999999999',
      }),
    ).toEqual(['driverEmail'])
  })

  it('NEW_VEHICLE exige modelo do veículo e telefone de contato', () => {
    expect(validate('NEW_VEHICLE', {})).toEqual(['vehicleModel', 'contactPhone'])
    expect(validate('NEW_VEHICLE', { vehicleModel: 'Onix', contactPhone: '11999999999' })).toEqual(
      [],
    )
  })

  it('BOTH exige condutor + veículo + contato', () => {
    expect(validate('BOTH', {})).toEqual(['driverName', 'vehicleModel', 'contactPhone'])
    expect(
      validate('BOTH', {
        driverName: 'Marina',
        vehicleModel: 'Onix',
        contactPhone: '11999999999',
      }),
    ).toEqual([])
  })

  it('aceita cor e documento vazios (campos opcionais)', () => {
    expect(
      validate('NEW_VEHICLE', {
        vehicleModel: 'Onix',
        vehicleColor: '',
        contactPhone: '11999999999',
      }),
    ).toEqual([])
  })
})
