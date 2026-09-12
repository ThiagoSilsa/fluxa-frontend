import { describe, expect, it, vi } from 'vitest'

// Lib
import {
  DEVICE_ENTRANCE_STORAGE_KEY,
  findDeviceEntrance,
  getDeviceEntranceId,
  setDeviceEntranceId,
} from './device-entrance'

import type { DeviceEntranceStorage } from './device-entrance'

/** Storage em memória (o `localStorage` real não existe no ambiente de teste). */
function createStorage(initial: Record<string, string> = {}): DeviceEntranceStorage & {
  values: Record<string, string>
} {
  const values = { ...initial }

  return {
    values,
    getItem: vi.fn((key: string) => values[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete values[key]
    }),
  }
}

describe('getDeviceEntranceId', () => {
  it('lê a portaria gravada no dispositivo', () => {
    const storage = createStorage({ [DEVICE_ENTRANCE_STORAGE_KEY]: 'entrance-1' })

    expect(getDeviceEntranceId(storage)).toBe('entrance-1')
  })

  it('devolve null (sem portaria) quando não há nada gravado', () => {
    expect(getDeviceEntranceId(createStorage())).toBeNull()
  })

  it('trata valor em branco como sem portaria', () => {
    const storage = createStorage({ [DEVICE_ENTRANCE_STORAGE_KEY]: '   ' })

    expect(getDeviceEntranceId(storage)).toBeNull()
  })

  it('devolve null quando o storage não está disponível (SSR/modo restrito)', () => {
    expect(getDeviceEntranceId(null)).toBeNull()
  })
})

describe('setDeviceEntranceId', () => {
  it('grava a portaria escolhida', () => {
    const storage = createStorage()

    setDeviceEntranceId('entrance-2', storage)

    expect(storage.values[DEVICE_ENTRANCE_STORAGE_KEY]).toBe('entrance-2')
  })

  it('remove a escolha quando recebe null/vazio (volta para "sem portaria")', () => {
    const storage = createStorage({ [DEVICE_ENTRANCE_STORAGE_KEY]: 'entrance-1' })

    setDeviceEntranceId(null, storage)
    expect(storage.values[DEVICE_ENTRANCE_STORAGE_KEY]).toBeUndefined()

    setDeviceEntranceId('   ', storage)
    expect(storage.values[DEVICE_ENTRANCE_STORAGE_KEY]).toBeUndefined()
  })

  it('não quebra sem storage disponível', () => {
    expect(() => setDeviceEntranceId('entrance-1', null)).not.toThrow()
  })

  it('faz round-trip com a leitura', () => {
    const storage = createStorage()

    setDeviceEntranceId('entrance-3', storage)

    expect(getDeviceEntranceId(storage)).toBe('entrance-3')
  })
})

describe('findDeviceEntrance', () => {
  const entrances = [
    { id: 'entrance-1', name: 'Portaria principal' },
    { id: 'entrance-2', name: 'Portaria fundos' },
  ]

  it('devolve a portaria ativa correspondente', () => {
    expect(findDeviceEntrance('entrance-2', entrances)).toEqual(entrances[1])
  })

  it('devolve null quando não há portaria escolhida', () => {
    expect(findDeviceEntrance(null, entrances)).toBeNull()
  })

  it('devolve null quando a portaria foi desativada/apagada (fallback)', () => {
    expect(findDeviceEntrance('entrance-removida', entrances)).toBeNull()
    expect(findDeviceEntrance('entrance-1', undefined)).toBeNull()
    expect(findDeviceEntrance('entrance-1', [])).toBeNull()
  })
})
