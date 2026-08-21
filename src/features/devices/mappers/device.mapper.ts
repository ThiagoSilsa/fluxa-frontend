// Schemas
import type { DeviceFormValues } from '../schemas/device.schema'

// Types
import type {
  CreateDevicePayload,
  DeviceEntity,
  DeviceListParams,
  UpdateDevicePayload,
} from '../types/devices.types'

/** Normaliza os valores padrão do formulário de dispositivo. */
export function normalizeDeviceFormDefaults(device?: DeviceEntity): DeviceFormValues {
  return {
    name: device?.name ?? '',
    platform: device?.platform ?? 'ANDROID',
    entranceId: device?.entranceId ?? '',
    isActive: device?.isActive ?? true,
  }
}

/** Converte os valores do formulário no payload de criação. */
export function toCreateDevicePayload(values: DeviceFormValues): CreateDevicePayload {
  const payload: CreateDevicePayload = {
    name: values.name.trim(),
    platform: values.platform,
  }

  if (values.entranceId) {
    payload.entranceId = values.entranceId
  }

  return payload
}

/**
 * Converte os valores do formulário no payload de atualização (diff).
 *
 * `entranceId`: vazio (`''`) vira `null` (desvincular portaria — ADR 0008 §4)
 * quando o vínculo atual existe; id diferente vira o novo vínculo; inalterado
 * não entra no payload. `platform` é imutável e nunca entra.
 */
export function toUpdateDevicePayload(
  values: DeviceFormValues,
  original: DeviceFormValues,
): UpdateDevicePayload {
  const payload: UpdateDevicePayload = {}

  if (values.name.trim() !== original.name) {
    payload.name = values.name.trim()
  }

  const newEntrance = values.entranceId || null
  const currentEntrance = original.entranceId || null
  if (newEntrance !== currentEntrance) {
    payload.entranceId = newEntrance
  }

  if (values.isActive !== original.isActive) {
    payload.isActive = values.isActive
  }

  return payload
}

/** Monta a query string da listagem paginada/ordenada. */
export function buildDeviceListQuery(params: DeviceListParams) {
  const searchParams = new URLSearchParams()

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  if (params.sortBy) {
    searchParams.set('sortBy', params.sortBy)
  }

  if (params.sortOrder) {
    searchParams.set('sortOrder', params.sortOrder)
  }

  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit))
  }

  if (params.offset !== undefined) {
    searchParams.set('offset', String(params.offset))
  }

  return searchParams.toString()
}
