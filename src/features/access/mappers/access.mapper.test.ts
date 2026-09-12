import { describe, expect, it } from 'vitest'
import {
  buildAccessContextQuery,
  buildAccessRecordsQuery,
  getOccupancyRate,
  toIsoDayRange,
  toOccupancyViewModel,
  toRegisterDenialPayload,
  toRegisterEntryPayload,
  toRegisterExitPayload,
  toRegisterRequestBlock,
} from './access.mapper'

describe('getOccupancyRate', () => {
  it('calcula o percentual arredondado', () => {
    expect(getOccupancyRate(3, 10)).toBe(30)
    expect(getOccupancyRate(1, 3)).toBe(33)
  })

  it('devolve null quando não há capacidade', () => {
    expect(getOccupancyRate(2, 0)).toBeNull()
  })
})

describe('toOccupancyViewModel', () => {
  it('adiciona o percentual por departamento e o global', () => {
    const view = toOccupancyViewModel({
      totalOccupied: 5,
      totalCapacity: 10,
      freeSlots: 5,
      byDepartment: [
        { departmentId: 'd1', name: 'Recepção', occupied: 2, capacity: 4 },
        { departmentId: 'd2', name: 'Operação', occupied: 3, capacity: 0 },
      ],
    })

    expect(view.totalRate).toBe(50)
    expect(view.byDepartment).toEqual([
      { departmentId: 'd1', name: 'Recepção', occupied: 2, capacity: 4, rate: 50 },
      { departmentId: 'd2', name: 'Operação', occupied: 3, capacity: 0, rate: null },
    ])
  })

  it('propaga freeSlots e totalRate null sem capacidade', () => {
    const view = toOccupancyViewModel({
      totalOccupied: 2,
      totalCapacity: 0,
      freeSlots: 0,
      byDepartment: [],
    })

    expect(view.totalRate).toBeNull()
    expect(view.freeSlots).toBe(0)
    expect(view.byDepartment).toEqual([])
  })
})

describe('toRegisterEntryPayload', () => {
  it('normaliza a placa e omite campos vazios', () => {
    const payload = toRegisterEntryPayload({
      plate: ' abc-1d23 ',
      accessRequestId: '',
      temporaryDriverName: '',
    })

    expect(payload).toEqual({ plate: 'ABC1D23' })
  })

  it('inclui accessRequestId e temporaryDriverName quando preenchidos', () => {
    const payload = toRegisterEntryPayload({
      plate: 'abc1234',
      accessRequestId: '90000000-0000-0000-0000-000000000001',
      temporaryDriverName: '  Visitante  ',
    })

    expect(payload).toEqual({
      plate: 'ABC1234',
      accessRequestId: '90000000-0000-0000-0000-000000000001',
      temporaryDriverName: 'Visitante',
    })
  })

  it('omite accessRequestId com apenas espaços', () => {
    const payload = toRegisterEntryPayload({
      plate: 'ABC1D23',
      accessRequestId: '   ',
      temporaryDriverName: undefined,
    })

    expect(payload).toEqual({ plate: 'ABC1D23' })
  })

  it('acrescenta motorista, setor, portaria e origem vindos da ficha', () => {
    const payload = toRegisterEntryPayload(
      { plate: 'ABC1D23', temporaryDriverName: '' },
      {
        driverUserId: '30000000-0000-0000-0000-000000000005',
        departmentId: '20000000-0000-0000-0000-000000000001',
        entranceId: '10000000-0000-0000-0000-000000000001',
        source: 'QRCODE',
      },
    )

    expect(payload).toEqual({
      plate: 'ABC1D23',
      driverUserId: '30000000-0000-0000-0000-000000000005',
      departmentId: '20000000-0000-0000-0000-000000000001',
      entranceId: '10000000-0000-0000-0000-000000000001',
      source: 'QRCODE',
    })
  })

  it('só envia overCapacity quando confirmado (evita 409 desnecessário)', () => {
    expect(
      toRegisterEntryPayload({ plate: 'ABC1D23' }, { overCapacity: false }).overCapacity,
    ).toBeUndefined()
    expect(toRegisterEntryPayload({ plate: 'ABC1D23' }, { overCapacity: true }).overCapacity).toBe(
      true,
    )
  })

  it('monta o bloco request da exceção (criar a solicitação junto)', () => {
    const payload = toRegisterEntryPayload(
      { plate: 'ABC1D23' },
      {
        driverUserId: '30000000-0000-0000-0000-000000000005',
        request: {
          type: 'LINK',
          userType: 'VISITOR',
          contactPhone: '11999999999',
          payload: { driver: { name: 'Visitante' } },
        },
        entranceId: '10000000-0000-0000-0000-000000000001',
      },
    )

    expect(payload).toEqual({
      plate: 'ABC1D23',
      driverUserId: '30000000-0000-0000-0000-000000000005',
      entranceId: '10000000-0000-0000-0000-000000000001',
      request: {
        type: 'LINK',
        userType: 'VISITOR',
        contactPhone: '11999999999',
        payload: { driver: { name: 'Visitante' } },
      },
    })
  })

  it('descarta o bloco request quando há solicitação reaproveitada (mutuamente exclusivos)', () => {
    const payload = toRegisterEntryPayload(
      { plate: 'ABC1D23' },
      {
        accessRequestId: '90000000-0000-0000-0000-000000000001',
        request: { type: 'NEW_USER' },
      },
    )

    expect(payload).toEqual({
      plate: 'ABC1D23',
      accessRequestId: '90000000-0000-0000-0000-000000000001',
    })
    expect(payload.request).toBeUndefined()
  })
})

describe('toRegisterDenialPayload', () => {
  it('normaliza a placa e omite observação vazia', () => {
    const payload = toRegisterDenialPayload({ plate: ' abc-1d23 ', reason: 'BLOCKED' })

    expect(payload).toEqual({ plate: 'ABC1D23', reason: 'BLOCKED' })
  })

  it('acrescenta veículo/portaria/bloqueio resolvidos pelo contexto', () => {
    const payload = toRegisterDenialPayload(
      { plate: 'ABC1D23', reason: 'OTHER', observation: '  Sem autorização  ' },
      {
        vehicleId: '40000000-0000-0000-0000-000000000010',
        entranceId: '10000000-0000-0000-0000-000000000001',
        blockId: '60000000-0000-0000-0000-000000000001',
      },
    )

    expect(payload).toEqual({
      plate: 'ABC1D23',
      reason: 'OTHER',
      observation: 'Sem autorização',
      vehicleId: '40000000-0000-0000-0000-000000000010',
      entranceId: '10000000-0000-0000-0000-000000000001',
      blockId: '60000000-0000-0000-0000-000000000001',
    })
  })

  it('envia requestBlock + blockReason quando o porteiro marca o bloqueio', () => {
    const payload = toRegisterDenialPayload({
      plate: 'ABC1D23',
      reason: 'UNAUTHORIZED_DRIVER',
      observation: 'Motorista sem vínculo',
      requestBlock: true,
      blockReason: '  Motorista sem vínculo  ',
    })

    expect(payload).toEqual({
      plate: 'ABC1D23',
      reason: 'UNAUTHORIZED_DRIVER',
      observation: 'Motorista sem vínculo',
      requestBlock: true,
      blockReason: 'Motorista sem vínculo',
    })
  })

  it('não envia motivo de bloqueio sem pedido de bloqueio (checkbox desmarcado)', () => {
    const payload = toRegisterDenialPayload({
      plate: 'ABC1D23',
      reason: 'BLOCKED',
      requestBlock: false,
      blockReason: 'motivo digitado antes de desmarcar',
    })

    expect(payload).toEqual({ plate: 'ABC1D23', reason: 'BLOCKED' })
    expect(payload.requestBlock).toBeUndefined()
    expect(payload.blockReason).toBeUndefined()
  })
})

describe('toRegisterRequestBlock', () => {
  const values = {
    userType: 'VISITOR' as const,
    driverName: 'Marina',
    driverEmail: 'marina@teste.local',
    driverDocument: '123',
    driverPhone: '11999999999',
    contactPhone: '11888888888',
    vehicleModel: 'Onix',
    vehicleColor: 'Prata',
  }

  it('LINK: sem dados de condutor/veículo e sem telefone (regra 43)', () => {
    const block = toRegisterRequestBlock(
      { ...values, userType: 'VISITOR' },
      { type: 'LINK', departmentId: 'department-1' },
    )

    expect(block).toEqual({
      type: 'LINK',
      payload: {},
      departmentId: 'department-1',
    })
    expect(block.contactPhone).toBeUndefined()
  })

  it('NEW_USER: condutor novo + contato (sem veículo)', () => {
    const block = toRegisterRequestBlock(values, { type: 'NEW_USER' })

    expect(block).toEqual({
      type: 'NEW_USER',
      userType: 'VISITOR',
      payload: {
        driver: {
          name: 'Marina',
          email: 'marina@teste.local',
          document: '123',
          phone: '11999999999',
        },
      },
      contactPhone: '11888888888',
    })
    expect(block.payload?.vehicle).toBeUndefined()
  })

  it('NEW_VEHICLE: veículo novo + contato (sem condutor)', () => {
    const block = toRegisterRequestBlock(values, { type: 'NEW_VEHICLE' })

    expect(block).toEqual({
      type: 'NEW_VEHICLE',
      payload: { vehicle: { model: 'Onix', color: 'Prata' } },
      contactPhone: '11888888888',
    })
    expect(block.userType).toBeUndefined()
  })

  it('BOTH: condutor + veículo + tipo de usuário + contato', () => {
    const block = toRegisterRequestBlock(
      { ...values, userType: 'EMPLOYEE' },
      { type: 'BOTH', departmentId: 'department-2' },
    )

    expect(block).toMatchObject({
      type: 'BOTH',
      userType: 'EMPLOYEE',
      departmentId: 'department-2',
      contactPhone: '11888888888',
    })
    expect(block.payload?.driver?.name).toBe('Marina')
    expect(block.payload?.vehicle?.model).toBe('Onix')
  })

  it('omite os campos de texto vazios (form não preenchido por completo)', () => {
    const block = toRegisterRequestBlock(
      { ...values, driverEmail: '', driverDocument: '', driverPhone: '', vehicleColor: '' },
      { type: 'BOTH' },
    )

    expect(block.payload?.driver).toEqual({ name: 'Marina', document: null, phone: null })
    expect(block.payload?.driver?.email).toBeUndefined()
    expect(block.payload?.vehicle).toEqual({ model: 'Onix', color: undefined })
  })
})

describe('buildAccessContextQuery', () => {
  it('normaliza a placa e envia só os parâmetros preenchidos', () => {
    expect(buildAccessContextQuery({ plate: ' abc-1d23 ' })).toBe('plate=ABC1D23')
  })

  it('inclui busca, setor e motorista escolhido', () => {
    const query = buildAccessContextQuery({
      plate: 'ABC1D23',
      search: 'Marina',
      departmentId: 'd1',
      driverUserId: 'u1',
    })

    expect(query).toBe('plate=ABC1D23&search=Marina&departmentId=d1&driverUserId=u1')
  })

  it('codifica termos com espaço/acento', () => {
    const query = buildAccessContextQuery({ plate: 'ABC1D23', search: 'José da Silva' })

    expect(query).toContain('search=Jos%C3%A9+da+Silva')
  })
})

describe('buildAccessRecordsQuery', () => {
  it('envia só a paginação quando não há filtros', () => {
    expect(buildAccessRecordsQuery({ limit: 20, offset: 0 })).toBe('limit=20&offset=0')
  })

  it('aplica os defaults do backend quando a tabela não informa paginação', () => {
    expect(buildAccessRecordsQuery({})).toBe('limit=20&offset=0')
  })

  it('inclui todos os filtros preenchidos', () => {
    const query = buildAccessRecordsQuery({
      kind: 'DENIAL',
      plate: 'abc-1d23',
      dateFrom: '2026-09-01T03:00:00.000Z',
      dateTo: '2026-09-12T02:59:59.999Z',
      entranceId: 'e1',
      doormanId: 'u1',
      limit: 50,
      offset: 100,
    })

    expect(query).toBe(
      'kind=DENIAL&plate=ABC1D23&dateFrom=2026-09-01T03%3A00%3A00.000Z&dateTo=2026-09-12T02%3A59%3A59.999Z&entranceId=e1&doormanId=u1&limit=50&offset=100',
    )
  })
})

describe('toIsoDayRange', () => {
  it('devolve o início do dia informado e o fim do dia final', () => {
    const range = toIsoDayRange('2026-09-01', '2026-09-12')

    expect(range.dateFrom).toBe(new Date('2026-09-01T00:00:00.000').toISOString())
    // `dateTo` é inclusivo no backend: sem o fim do dia, o dia final ficaria de fora.
    expect(range.dateTo).toBe(new Date('2026-09-12T23:59:59.999').toISOString())
  })

  it('omite as chaves não informadas', () => {
    expect(toIsoDayRange()).toEqual({})
    expect(toIsoDayRange(null, null)).toEqual({})
    expect(toIsoDayRange('2026-09-01', null)).toEqual({
      dateFrom: new Date('2026-09-01T00:00:00.000').toISOString(),
    })
  })

  it('ignora dia inválido sem quebrar o filtro', () => {
    expect(toIsoDayRange('data-invalida', '2026-09-12').dateFrom).toBeUndefined()
    expect(toIsoDayRange('data-invalida', '2026-09-12').dateTo).toBeDefined()
  })
})

describe('toRegisterExitPayload', () => {
  it('normaliza a placa e omite passageiro vazio', () => {
    const payload = toRegisterExitPayload({
      plate: ' abc-1234 ',
      temporaryDriverName: '',
    })

    expect(payload).toEqual({ plate: 'ABC1234' })
  })

  it('inclui o passageiro quando preenchido', () => {
    const payload = toRegisterExitPayload({
      plate: 'ABC1D23',
      temporaryDriverName: 'Passageiro',
    })

    expect(payload).toEqual({ plate: 'ABC1D23', temporaryDriverName: 'Passageiro' })
  })
})
