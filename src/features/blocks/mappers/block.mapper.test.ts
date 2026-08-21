import { describe, expect, it } from 'vitest'
import {
  buildBlockRequestsListQuery,
  buildBlocksListQuery,
  toCreateBlockPayload,
  toRevokeBlockPayload,
} from './block.mapper'

describe('toCreateBlockPayload', () => {
  it('normaliza a placa e faz trim do motivo', () => {
    const payload = toCreateBlockPayload({
      plate: ' abc-1d23 ',
      reason: '  Furto suspeito  ',
    })

    expect(payload).toEqual({ plate: 'ABC1D23', reason: 'Furto suspeito' })
  })
})

describe('toRevokeBlockPayload', () => {
  it('faz trim do motivo', () => {
    expect(toRevokeBlockPayload({ reason: '  Engano  ' })).toEqual({ reason: 'Engano' })
  })
})

describe('buildBlocksListQuery', () => {
  it('monta a query com busca, status e paginação', () => {
    const query = buildBlocksListQuery({
      search: 'ABC1D23',
      status: 'ACTIVE',
      limit: 20,
      offset: 0,
    })

    expect(query).toContain('search=ABC1D23')
    expect(query).toContain('status=ACTIVE')
    expect(query).toContain('limit=20')
    expect(query).toContain('offset=0')
  })

  it('omite filtros vazios', () => {
    const query = buildBlocksListQuery({ limit: 10, offset: 20 })

    expect(query).not.toContain('search=')
    expect(query).not.toContain('status=')
  })
})

describe('buildBlockRequestsListQuery', () => {
  it('monta a query com status e paginação', () => {
    const query = buildBlockRequestsListQuery({
      status: 'PENDING',
      limit: 20,
      offset: 0,
    })

    expect(query).toContain('status=PENDING')
    expect(query).toContain('limit=20')
    expect(query).toContain('offset=0')
  })
})
