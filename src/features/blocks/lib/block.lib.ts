// Types
import type {
  BlockRequestStatus,
  VehicleBlockStatus,
  VehicleBlockType,
} from '../types/blocks.types'

/**
 * Mapeia o status do bloqueio para a chave de tradução do namespace `blocks`
 * (ex.: `ACTIVE` → `blockStatus.ACTIVE`).
 */
export function getBlockStatusLabelKey(status: VehicleBlockStatus): string {
  return `blockStatus.${status}`
}

/**
 * Mapeia o tipo do bloqueio para a chave de tradução (ex.: `MANUAL` →
 * `blockType.MANUAL`).
 */
export function getBlockTypeLabelKey(type: VehicleBlockType): string {
  return `blockType.${type}`
}

/**
 * Mapeia o status da solicitação de bloqueio para a chave de tradução
 * (ex.: `PENDING` → `requestStatus.PENDING`).
 */
export function getBlockRequestStatusLabelKey(status: BlockRequestStatus): string {
  return `requestStatus.${status}`
}

/**
 * Formata um instante ISO em data/hora local (ex.: `21/08/2026 14:30`).
 *
 * Valores `null`/vazios devolvem `'—'` (traço).
 *
 * @param iso Instante ISO ou `null`.
 * @returns Data/hora formatada no locale pt-BR.
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return '—'
  }

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
