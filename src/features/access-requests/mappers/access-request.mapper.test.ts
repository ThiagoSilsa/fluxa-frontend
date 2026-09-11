import { describe, expect, it } from 'vitest'
import {
  buildAccessRequestListQuery,
  toAcceptAccessRequestPayload,
  toCreateAccessRequestPayload,
  toCreateBlockRequestPayload,
} from './access-request.mapper'

describe('toCreateBlockRequestPayload', () => {
  it('normaliza placa e limpa o motivo', () => {
    const payload = toCreateBlockRequestPayload({
      plate: ' abc-1d23 ',
      reason: '  Furto suspeito  ',
    })

    expect(payload).toEqual({
      plate: 'ABC1D23',
      reason: 'Furto suspeito',
    })
  })
})

describe('toCreateAccessRequestPayload', () => {
  it('normaliza a placa e monta BOTH com payload completo', () => {
    const payload = toCreateAccessRequestPayload({
      type: 'BOTH',
      userType: 'EMPLOYEE',
      plate: ' abc-1d23 ',
      vehicleId: '',
      userId: '',
      contactChannel: 'WHATSAPP',
      contactPhone: ' 11999999999 ',
      driverName: 'Visitante',
      driverEmail: 'v@teste.local',
      driverDocument: '',
      driverPhone: '',
      vehicleModel: 'Gol',
      vehicleColor: 'Preto',
    })

    expect(payload).toEqual({
      plate: 'ABC1D23',
      type: 'BOTH',
      userType: 'EMPLOYEE',
      contactChannel: 'WHATSAPP',
      contactPhone: '11999999999',
      payload: {
        driver: { name: 'Visitante', email: 'v@teste.local' },
        vehicle: { model: 'Gol', color: 'Preto' },
      },
    })
  })

  it('NEW_USER mantém vehicleId, envia userType e assume WHATSAPP como canal', () => {
    const payload = toCreateAccessRequestPayload({
      type: 'NEW_USER',
      userType: 'VISITOR',
      plate: 'ABC1D23',
      vehicleId: '40000000-0000-0000-0000-000000000010',
      userId: '',
      contactChannel: undefined,
      contactPhone: '11999999999',
      driverName: 'Visitante',
      driverEmail: 'v@teste.local',
      driverDocument: '',
      driverPhone: '',
      vehicleModel: '',
      vehicleColor: '',
    })

    expect(payload).toMatchObject({
      type: 'NEW_USER',
      userType: 'VISITOR',
      vehicleId: '40000000-0000-0000-0000-000000000010',
      contactChannel: 'WHATSAPP',
      contactPhone: '11999999999',
    })
  })

  it('NEW_USER de Visitante sem e-mail não envia driver.email', () => {
    const payload = toCreateAccessRequestPayload({
      type: 'NEW_USER',
      userType: 'VISITOR',
      plate: 'ABC1D23',
      vehicleId: '40000000-0000-0000-0000-000000000010',
      userId: '',
      contactChannel: undefined,
      contactPhone: '11999999999',
      driverName: 'Visitante',
      driverEmail: '',
      driverDocument: '',
      driverPhone: '',
      vehicleModel: '',
      vehicleColor: '',
    })

    expect(payload.userType).toBe('VISITOR')
    expect(payload.payload?.driver).toEqual({ name: 'Visitante' })
  })

  it('LINK não envia payload/contato/userType (só vínculo)', () => {
    const payload = toCreateAccessRequestPayload({
      type: 'LINK',
      userType: 'EMPLOYEE',
      plate: 'ABC1234',
      vehicleId: '40000000-0000-0000-0000-000000000010',
      userId: '30000000-0000-0000-0000-000000000005',
      contactChannel: undefined,
      contactPhone: '',
      driverName: '',
      driverEmail: '',
      driverDocument: '',
      driverPhone: '',
      vehicleModel: '',
      vehicleColor: '',
    })

    expect(payload).toEqual({
      plate: 'ABC1234',
      type: 'LINK',
      vehicleId: '40000000-0000-0000-0000-000000000010',
      userId: '30000000-0000-0000-0000-000000000005',
    })
    expect(payload.userType).toBeUndefined()
  })
})

describe('toAcceptAccessRequestPayload', () => {
  const EMPTY = { vehicleTypeId: '', roleId: '', password: '' }
  const FILLED = { vehicleTypeId: 'vt-1', roleId: 'role-1', password: 'senha123' }

  it('LINK de Visitante envia apenas os defaults do fluxo', () => {
    const payload = toAcceptAccessRequestPayload(EMPTY, { type: 'LINK', userType: 'VISITOR' })

    expect(payload).toEqual({ canDrive: true, isPrimary: false })
  })

  it('NEW_VEHICLE inclui o tipo do veículo a criar (regra 22)', () => {
    const payload = toAcceptAccessRequestPayload(FILLED, {
      type: 'NEW_VEHICLE',
      userType: 'VISITOR',
    })

    expect(payload).toEqual({ canDrive: true, isPrimary: false, vehicleTypeId: 'vt-1' })
  })

  it('BOTH de Colaborador inclui tipo, cargo e senha (ADR 0013)', () => {
    const payload = toAcceptAccessRequestPayload(FILLED, { type: 'BOTH', userType: 'EMPLOYEE' })

    expect(payload).toEqual({
      canDrive: true,
      isPrimary: false,
      vehicleTypeId: 'vt-1',
      roleId: 'role-1',
      password: 'senha123',
    })
  })

  it('NEW_USER de Colaborador inclui cargo e senha, sem tipo de veículo', () => {
    const payload = toAcceptAccessRequestPayload(FILLED, {
      type: 'NEW_USER',
      userType: 'EMPLOYEE',
    })

    expect(payload).toEqual({
      canDrive: true,
      isPrimary: false,
      roleId: 'role-1',
      password: 'senha123',
    })
    expect(payload.vehicleTypeId).toBeUndefined()
  })

  it('BOTH de Visitante não inclui cargo/senha', () => {
    const payload = toAcceptAccessRequestPayload(FILLED, { type: 'BOTH', userType: 'VISITOR' })

    expect(payload).toEqual({ canDrive: true, isPrimary: false, vehicleTypeId: 'vt-1' })
    expect(payload.roleId).toBeUndefined()
    expect(payload.password).toBeUndefined()
  })
})

describe('buildAccessRequestListQuery', () => {
  it('monta a query com status, placa e paginação', () => {
    const query = buildAccessRequestListQuery({
      status: 'PENDING',
      plate: 'ABC1D23',
      limit: 20,
      offset: 0,
    })

    expect(query).toContain('status=PENDING')
    expect(query).toContain('plate=ABC1D23')
    expect(query).toContain('limit=20')
    expect(query).toContain('offset=0')
  })

  it('omite filtros vazios e sempre envia paginação', () => {
    const query = buildAccessRequestListQuery({ limit: 10, offset: 20 })

    expect(query).not.toContain('status=')
    expect(query).not.toContain('plate=')
    expect(query).toContain('limit=10')
    expect(query).toContain('offset=20')
  })
})
