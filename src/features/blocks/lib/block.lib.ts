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
