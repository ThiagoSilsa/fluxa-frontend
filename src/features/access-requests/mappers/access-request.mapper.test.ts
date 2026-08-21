import { describe, expect, it } from 'vitest'
import { buildAccessRequestListQuery, toCreateAccessRequestPayload } from './access-request.mapper'

describe('toCreateAccessRequestPayload', () => {
  it('normaliza a placa e monta BOTH com payload completo', () => {
    const payload = toCreateAccessRequestPayload({
      type: 'BOTH',
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
      contactChannel: 'WHATSAPP',
      contactPhone: '11999999999',
      payload: {
        driver: { name: 'Visitante', email: 'v@teste.local' },
        vehicle: { model: 'Gol', color: 'Preto' },
      },
    })
  })

  it('NEW_USER mantém vehicleId e assume WHATSAPP como canal', () => {
    const payload = toCreateAccessRequestPayload({
      type: 'NEW_USER',
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
      vehicleId: '40000000-0000-0000-0000-000000000010',
      contactChannel: 'WHATSAPP',
      contactPhone: '11999999999',
    })
  })

  it('LINK não envia payload/contato (só vínculo)', () => {
    const payload = toCreateAccessRequestPayload({
      type: 'LINK',
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
