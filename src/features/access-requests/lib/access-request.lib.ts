// Types
import type { AccessRequestStatus, AccessRequestType } from '../types/access-requests.types'

/**
 * Mapeia o cenário para a chave de tradução do namespace `accessRequests`
 * (ex.: `NEW_USER` → `type.NEW_USER`).
 */
export function getAccessRequestTypeLabelKey(type: AccessRequestType): string {
  return `type.${type}`
}

/**
 * Mapeia o status para a chave de tradução do namespace `accessRequests`
 * (ex.: `PENDING` → `status.PENDING`).
 */
export function getAccessRequestStatusLabelKey(status: AccessRequestStatus): string {
  return `status.${status}`
}
