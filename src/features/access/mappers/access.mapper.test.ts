import { describe, expect, it } from 'vitest'
import {
  getOccupancyRate,
  toOccupancyViewModel,
  toRegisterEntryPayload,
  toRegisterExitPayload,
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
