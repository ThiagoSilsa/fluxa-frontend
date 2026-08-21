import { describe, expect, it } from 'vitest'
import { toRegisterEntryPayload, toRegisterExitPayload } from './access.mapper'

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
