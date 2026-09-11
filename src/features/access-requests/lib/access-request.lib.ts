// Types
import type {
  AccessRequestStatus,
  AccessRequestType,
  AccessRequestUserType,
} from '../types/access-requests.types'

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

/**
 * Mapeia o tipo de usuário do motorista para a chave de tradução do namespace
 * `accessRequests` (ex.: `VISITOR` → `userType.VISITOR`).
 */
export function getAccessRequestUserTypeLabelKey(userType: AccessRequestUserType): string {
  return `userType.${userType}`
}

/**
 * Indica se o cenário cria/define o motorista da solicitação (ADR 0013).
 *
 * O tipo de usuário só é relevante em `NEW_USER`/`BOTH` — nos demais o
 * motorista já existe e a solicitação permanece `VISITOR`.
 */
export function accessRequestCreatesDriver(type: AccessRequestType): boolean {
  return type === 'NEW_USER' || type === 'BOTH'
}
