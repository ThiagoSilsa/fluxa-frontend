// Types
import type { AccessRecordEntranceOption } from '../types/access.types'

/**
 * Chave única da portaria do dispositivo no `localStorage`.
 *
 * É a mesma para entrada, saída e impedimento (o balcão tem **uma** portaria
 * física): o porteiro escolhe uma vez no cabeçalho e todos os registros do
 * dispositivo passam a carimbar `entranceId` (regra 61).
 */
export const DEVICE_ENTRANCE_STORAGE_KEY = 'fluxa:access:device-entrance-id'

/** Armazenamento mínimo lido/gravado pela lib (facilita o teste). */
export interface DeviceEntranceStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

/**
 * Resolve o `localStorage` do navegador.
 *
 * Devolve `null` no SSR (sem `window`) ou quando o storage não está acessível
 * (modo privado/restrito) — a lib nunca deve derrubar a portaria por isso.
 *
 * @returns Storage do navegador ou `null`.
 */
function getBrowserStorage(): DeviceEntranceStorage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Lê a portaria gravada no dispositivo.
 *
 * `null` significa **"sem portaria"**: o registro é enviado sem `entranceId`,
 * que é o comportamento aceito pelo backend (campo opcional).
 *
 * @param storage Storage alternativo (testes); default: `localStorage`.
 * @returns Id da portaria ou `null`.
 */
export function getDeviceEntranceId(storage: DeviceEntranceStorage | null = getBrowserStorage()) {
  if (!storage) {
    return null
  }

  const value = storage.getItem(DEVICE_ENTRANCE_STORAGE_KEY)?.trim()
  return value ? value : null
}

/**
 * Grava (ou limpa) a portaria do dispositivo.
 *
 * @param entranceId Id da portaria; `null`/vazio remove a escolha ("sem
 *   portaria").
 * @param storage Storage alternativo (testes); default: `localStorage`.
 */
export function setDeviceEntranceId(
  entranceId: string | null,
  storage: DeviceEntranceStorage | null = getBrowserStorage(),
): void {
  if (!storage) {
    return
  }

  const value = entranceId?.trim()
  if (!value) {
    storage.removeItem(DEVICE_ENTRANCE_STORAGE_KEY)
    return
  }

  storage.setItem(DEVICE_ENTRANCE_STORAGE_KEY, value)
}

/**
 * Confere se a portaria gravada ainda existe entre as portarias **ativas**
 * (`parameters` do feed, chave `entrance_id`).
 *
 * Serve para o fallback "sem portaria": a portaria pode ter sido desativada
 * (ou apagada) desde a última visita do dispositivo — nesse caso a seleção cai
 * para "sem portaria" em vez de o registro falhar com 400/404.
 *
 * @param entranceId Id gravado no dispositivo.
 * @param entrances Portarias ativas devolvidas pelo backend.
 * @returns A portaria ativa correspondente, ou `null`.
 */
export function findDeviceEntrance(
  entranceId: string | null,
  entrances: AccessRecordEntranceOption[] | undefined,
): AccessRecordEntranceOption | null {
  if (!entranceId) {
    return null
  }
  return entrances?.find((entrance) => entrance.id === entranceId) ?? null
}
