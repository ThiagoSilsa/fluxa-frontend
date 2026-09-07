/**
 * Tipos do fluxo de solicitações de acesso (espelho do backend — ADR 0010
 * M2/regra 41).
 *
 * A web consome `POST /access-requests`, `GET /access-requests`,
 * `GET /access-requests/:id` e as transições `accept`/`reject`/`in-contact`/
 * `cancel`.
 */

/** Cenários de solicitação de acesso. */
export type AccessRequestType = 'NEW_USER' | 'NEW_VEHICLE' | 'LINK' | 'BOTH'

/** Situação de uma solicitação. */
export type AccessRequestStatus = 'PENDING' | 'IN_CONTACT' | 'REGISTERED' | 'REJECTED' | 'CANCELLED'

/** Canal de contato do motorista. */
export type ContactChannel = 'WHATSAPP' | 'PHONE' | 'EMAIL'

/** Dados de criação enviados no `payload` (jsonb). */
export interface AccessRequestPayload {
  driver?: {
    name?: string
    email?: string
    document?: string | null
    phone?: string | null
  }
  vehicle?: {
    model?: string
    color?: string
  }
}

/** Resumo de um ator (porteiro que solicitou / admin que atendeu). */
export interface AccessRequestActorSummary {
  id: string
  name: string
}

/** Solicitação de acesso no formato de resposta. */
export interface AccessRequestResponse {
  id: string
  type: AccessRequestType
  plate: string
  vehicleId: string | null
  userId: string | null
  status: AccessRequestStatus
  entryAuthorized: boolean
  requestedBy: AccessRequestActorSummary
  requestedAt: string
  handledBy: AccessRequestActorSummary | null
  handledAt: string | null
  authorizedBy: AccessRequestActorSummary | null
  authorizedAt: string | null
  contactChannel: ContactChannel | null
  contactPhone: string | null
  departmentId: string | null
  payload: AccessRequestPayload
  statusHistory: unknown[]
  resolvedUserId: string | null
  resolvedVehicleId: string | null
  observation: string | null
  createdAt: string
}

/** Resposta paginada de solicitações. */
export interface ListAccessRequestsResponse {
  limit: number
  offset: number
  data: AccessRequestResponse[]
  count: number
}

/** Parâmetros de listagem (server-side). */
export interface AccessRequestListParams {
  status?: AccessRequestStatus
  plate?: string
  limit: number
  offset: number
}

/** Payload de criação. */
export interface CreateAccessRequestPayload {
  plate: string
  type: AccessRequestType
  vehicleId?: string
  userId?: string
  contactChannel?: ContactChannel
  contactPhone?: string
  departmentId?: string
  payload?: AccessRequestPayload
}

/** Payload de solicitação de bloqueio (placa + motivo) — `POST /block-requests`. */
export interface CreateBlockRequestPayload {
  plate: string
  reason: string
}

/** Status de uma solicitação de bloqueio (visão "minhas solicitações"). */
export type BlockRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

/** Solicitação de bloqueio (visão enxuta — "minhas solicitações"). */
export interface BlockRequestItem {
  id: string
  plate: string
  reason: string
  status: BlockRequestStatus
  requestedBy: { id: string; name: string }
  requestedAt: string
}

/** Resposta paginada de solicitações de bloqueio. */
export interface ListBlockRequestsResponse {
  limit: number
  offset: number
  data: BlockRequestItem[]
  count: number
}

/** Payload de transições com observação (rejeitar/in-contact). */
export interface HandleAccessRequestPayload {
  observation?: string
}

/** Payload de aceite (resolução retroativa). */
export interface AcceptAccessRequestPayload {
  vehicleTypeId?: string
  canDrive?: boolean
  isPrimary?: boolean
  observation?: string
}

/**
 * Opção de veículo para o seletor (cenários NEW_USER/LINK) — endpoint de
 * baixo privilégio `/vehicles/options` (ADR 0011).
 */
export interface VehicleOption {
  id: string
  plate: string
  model: string | null
}

/** Opção de usuário para o seletor (cenários NEW_VEHICLE/LINK). */
export interface UserOption {
  id: string
  name: string
  email: string
}

/** Opção de tipo de veículo (aceite de NEW_VEHICLE/BOTH). */
export interface VehicleTypeOption {
  id: string
  code: string
  name: string
}
