import { describe, expect, it } from 'vitest'
import {
  buildDeviceListQuery,
  normalizeDeviceFormDefaults,
  toCreateDevicePayload,
  toUpdateDevicePayload,
} from './device.mapper'

import type { DeviceEntity } from '../types/devices.types'

const device: DeviceEntity = {
  id: 'device-1',
  name: 'Tablet Portaria 1',
  platform: 'ANDROID',
  appVersion: null,
  entranceId: 'entrance-1',
  entrance: { id: 'entrance-1', name: 'Portaria Principal' },
  lastSyncAt: null,
  isActive: true,
  createdAt: '2026-08-21T00:00:00.000Z',
  updatedAt: '2026-08-21T00:00:00.000Z',
}

describe('normalizeDeviceFormDefaults', () => {
  it('devolve valores padrão vazios/ativos para criação', () => {
    expect(normalizeDeviceFormDefaults()).toEqual({
      name: '',
      platform: 'ANDROID',
      entranceId: '',
      isActive: true,
    })
  })

  it('devolve os valores do dispositivo em edição', () => {
    expect(normalizeDeviceFormDefaults(device)).toEqual({
      name: 'Tablet Portaria 1',
      platform: 'ANDROID',
      entranceId: 'entrance-1',
      isActive: true,
    })
  })
})

describe('toCreateDevicePayload', () => {
  it('converte os valores do formulário no payload de criação', () => {
    expect(
      toCreateDevicePayload({
        name: '  Tablet Portaria 2  ',
        platform: 'IOS',
        entranceId: 'entrance-1',
        isActive: true,
      }),
    ).toEqual({
      name: 'Tablet Portaria 2',
      platform: 'IOS',
      entranceId: 'entrance-1',
    })
  })

  it('omite entranceId quando vazio', () => {
    expect(
      toCreateDevicePayload({
        name: 'Tablet',
        platform: 'ANDROID',
        entranceId: '',
        isActive: true,
      }),
    ).toEqual({ name: 'Tablet', platform: 'ANDROID' })
  })
})

describe('toUpdateDevicePayload', () => {
  const original = normalizeDeviceFormDefaults(device)

  it('devolve payload vazio quando nada mudou', () => {
    expect(toUpdateDevicePayload(original, original)).toEqual({})
  })

  it('envia apenas o nome quando alterado', () => {
    expect(toUpdateDevicePayload({ ...original, name: 'Tablet Renomeado' }, original)).toEqual({
      name: 'Tablet Renomeado',
    })
  })

  it('desvincula a portaria com entranceId vazio (null)', () => {
    expect(toUpdateDevicePayload({ ...original, entranceId: '' }, original)).toEqual({
      entranceId: null,
    })
  })

  it('troca a portaria quando o vínculo muda', () => {
    expect(toUpdateDevicePayload({ ...original, entranceId: 'entrance-2' }, original)).toEqual({
      entranceId: 'entrance-2',
    })
  })

  it('envia isActive quando o status muda', () => {
    expect(toUpdateDevicePayload({ ...original, isActive: false }, original)).toEqual({
      isActive: false,
    })
  })

  it('nunca envia platform (imutável — ADR 0008 §7)', () => {
    const payload = toUpdateDevicePayload({ ...original, platform: 'IOS' }, original)
    expect(payload).not.toHaveProperty('platform')
  })
})

describe('buildDeviceListQuery', () => {
  it('monta a query string com busca, filtro, ordenação e paginação', () => {
    expect(
      buildDeviceListQuery({
        search: 'Tablet',
        isActive: true,
        sortBy: 'lastSyncAt',
        sortOrder: 'DESC',
        limit: 10,
        offset: 20,
      }),
    ).toBe('search=Tablet&isActive=true&sortBy=lastSyncAt&sortOrder=DESC&limit=10&offset=20')
  })

  it('ignora campos ausentes', () => {
    expect(buildDeviceListQuery({})).toBe('')
  })
})
