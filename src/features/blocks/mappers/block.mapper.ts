// Types
import type {
  BlockListParams,
  BlockRequestListParams,
  CreateBlockPayload,
  RevokeBlockPayload,
} from '../types/blocks.types'

// Utils
import { normalizePlate } from '../utils/plate'

// Schemas
import type { BlockFormValues, RevokeBlockValues } from '../schemas/block.schema'

/**
 * Converte o formulário de bloqueio/solicitação no payload — placa
 * normalizada e motivo com trim.
 *
 * @param values Valores validados do formulário.
 * @returns Payload de criação.
 */
export function toCreateBlockPayload(values: BlockFormValues): CreateBlockPayload {
  return {
    plate: normalizePlate(values.plate),
    reason: values.reason.trim(),
  }
}

/**
 * Converte o formulário de revogação no payload (motivo com trim).
 *
 * @param values Valores validados do formulário.
 * @returns Payload de revogação.
 */
export function toRevokeBlockPayload(values: RevokeBlockValues): RevokeBlockPayload {
  return {
    reason: values.reason.trim(),
  }
}

/**
 * Monta a query de listagem de bloqueios (busca + status + paginação).
 *
 * @param params Filtros e paginação.
 * @returns Query string.
 */
export function buildBlocksListQuery(params: BlockListParams): string {
  const search = new URLSearchParams()
  if (params.search) {
    search.set('search', params.search)
  }
  if (params.status) {
    search.set('status', params.status)
  }
  search.set('limit', String(params.limit))
  search.set('offset', String(params.offset))
  return search.toString()
}

/**
 * Monta a query de listagem de solicitações de bloqueio (status + paginação).
 *
 * @param params Filtros e paginação.
 * @returns Query string.
 */
export function buildBlockRequestsListQuery(params: BlockRequestListParams): string {
  const search = new URLSearchParams()
  if (params.status) {
    search.set('status', params.status)
  }
  search.set('limit', String(params.limit))
  search.set('offset', String(params.offset))
  return search.toString()
}
