/**
 * Tipos do fluxo de bloqueios (espelho do backend — ADR 0010 §2/M1).
 *
 * A web consome `/blocks` (listar/criar/revogar), `/block-requests`
 * (porteiro cria/cancela; administração aprova/rejeita) — o `is_blocked` do
 * veículo é mantido por esta feature.
 */

/** Status de um bloqueio (única mutação: ACTIVE → REVOKED). */
export type VehicleBlockStatus = 'ACTIVE' | 'REVOKED'

/** Tipo de bloqueio. */
export type VehicleBlockType = 'MANUAL' | 'AUTOMATIC'

/** Status de uma solicitação de bloqueio. */
export type BlockRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

/** Resumo de um ator (quem bloqueou/revogou/avaliou). */
export interface BlockActorSummary {
  id: string
  name: string
}

/** Bloqueio de veículo no formato de resposta. */
export interface BlockResponse {
  id: string
  plate: string
  vehicleId: string | null
  blockType: VehicleBlockType
  reason: string
  status: VehicleBlockStatus
  blockedBy: BlockActorSummary | null
  blockedAt: string
  revokedBy: BlockActorSummary | null
  revokedAt: string | null
  revokedReason: string | null
  createdAt: string
}

/** Resposta paginada de bloqueios. */
export interface ListBlocksResponse {
  limit: number
  offset: number
  data: BlockResponse[]
  count: number
}

/** Parâmetros de listagem de bloqueios (server-side). */
export interface BlockListParams {
  search?: string
  status?: VehicleBlockStatus
  limit: number
  offset: number
}

/** Solicitação de bloqueio no formato de resposta. */
export interface BlockRequestResponse {
  id: string
  plate: string
  vehicleId: string | null
  reason: string
  status: BlockRequestStatus
  requestedBy: BlockActorSummary
  requestedAt: string
  handledBy: BlockActorSummary | null
  handledAt: string | null
  observation: string | null
  statusHistory: unknown[]
  resolvedBlockId: string | null
  createdAt: string
}

/** Resposta paginada de solicitações de bloqueio. */
export interface ListBlockRequestsResponse {
  limit: number
  offset: number
  data: BlockRequestResponse[]
  count: number
}

/** Parâmetros de listagem de solicitações de bloqueio. */
export interface BlockRequestListParams {
  status?: BlockRequestStatus
  limit: number
  offset: number
}

/** Payload de criação de bloqueio/solicitação (placa + motivo). */
export interface CreateBlockPayload {
  plate: string
  reason: string
}

/** Payload de revogação de bloqueio (motivo obrigatório). */
export interface RevokeBlockPayload {
  reason: string
}

/** Payload de transição de solicitação (observação opcional). */
export interface HandleBlockRequestPayload {
  observation?: string
}
