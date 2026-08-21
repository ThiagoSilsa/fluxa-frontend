// Schemas
import type { EntranceFormValues } from '../schemas/entrance.schema'

// Types
import type {
  CreateEntrancePayload,
  EntranceEntity,
  EntranceListParams,
  UpdateEntrancePayload,
} from '../types/entrances.types'

/** Normaliza os valores padrão do formulário. */
export function normalizeEntranceFormDefaults(entrance?: EntranceEntity): EntranceFormValues {
  return {
    name: entrance?.name ?? '',
    isActive: entrance?.isActive ?? true,
  }
}

/** Converte os valores do formulário no payload de criação. */
export function toCreateEntrancePayload(values: EntranceFormValues): CreateEntrancePayload {
  return {
    name: values.name.trim(),
  }
}

/** Converte os valores do formulário no payload de atualização (diff). */
export function toUpdateEntrancePayload(
  values: EntranceFormValues,
  original: EntranceFormValues,
): UpdateEntrancePayload {
  const payload: UpdateEntrancePayload = {}

  const name = values.name.trim()
  if (name !== original.name.trim()) {
    payload.name = name
  }

  if (values.isActive !== original.isActive) {
    payload.isActive = values.isActive
  }

  return payload
}

/** Monta a query string da listagem paginada. */
export function buildEntranceListQuery(params: EntranceListParams) {
  const searchParams = new URLSearchParams()

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit))
  }

  if (params.offset !== undefined) {
    searchParams.set('offset', String(params.offset))
  }

  return searchParams.toString()
}
