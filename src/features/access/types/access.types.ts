/**
 * Tipos do fluxo de acesso (espelho das respostas do backend — ADR 0010).
 *
 * A portaria web consome `POST /access/entry`, `POST /access/exit`,
 * `GET /access/open` e `GET /qr-codes/:code` (resolução de QR para a
 * entrada por código).
 */

/** Origem do movimento (espelho do backend — M4). */
export type MovementSource = 'PLATE' | 'QRCODE' | 'APP' | 'MANUAL' | 'INITIAL' | 'WEB'

/** Tipo de movimento (ledger imutável). */
export type MovementType = 'ENTRY' | 'EXIT'

/** Situação de uma visita. */
export type AccessStatus = 'INSIDE' | 'OUT' | 'NO_EXIT' | 'MANUAL_CLOSED'

/** Status de sincronização do movimento (offline). */
export type SyncStatus = 'PENDING' | 'SYNCED'

/** Motivo do impedimento de entrada. */
export type EntryDenialReason = 'BLOCKED' | 'UNREGISTERED' | 'UNAUTHORIZED_DRIVER' | 'OTHER'

/** Visita (acesso) — formato de resposta. */
export interface AccessResponse {
  id: string
  vehicleId: string | null
  temporaryPlate: string | null
  driverUserId: string | null
  temporaryDriverName: string | null
  departmentId: string | null
  accessRequestId: string | null
  overCapacity: boolean
  status: AccessStatus
  forcedExit: boolean
  entryAt: string | null
  exitAt: string | null
  closedBy: string | null
  closedAt: string | null
}

/** Evento de movimento (ledger imutável). */
export interface MovementResponse {
  id: string
  accessId: string | null
  vehicleId: string | null
  type: MovementType
  occurredAt: string
  plateSnapshot: string
  driverUserId: string | null
  departmentId: string | null
  source: MovementSource
  entranceId: string | null
  doormanId: string | null
  syncStatus: SyncStatus
}

/** Visita + movimento (entrada registrada, saída registrada, reentrada). */
export interface ClosedAccessResponse {
  access: AccessResponse
  movement: MovementResponse
}

/** Impedimento de entrada registrado automaticamente. */
export interface EntryDenialResponse {
  id: string
  plateSnapshot: string
  vehicleId: string | null
  blockId: string | null
  reason: EntryDenialReason
  observation: string | null
  doormanId: string
  occurredAt: string
}

/** Resposta do registro de entrada — `granted` discrimina liberação vs. impedimento. */
export interface AccessEntryResponse {
  granted: boolean
  message: string
  access?: AccessResponse
  movement?: MovementResponse
  previousClosed?: ClosedAccessResponse | null
  denial?: EntryDenialResponse
}

/** Resposta do registro de saída. */
export interface AccessExitResponse {
  closedAccesses: ClosedAccessResponse[]
  noExit: ClosedAccessResponse | null
}

/** Acesso aberto (conferência na saída). */
export interface OpenAccessResponse {
  id: string
  vehicleId: string | null
  temporaryPlate: string | null
  driver: { id: string | null; name: string | null }
  departmentId: string | null
  entryAt: string | null
  overCapacity: boolean
}

/** Ocupação por departamento (GET /access/occupancy). */
export interface OccupancyDepartmentResponse {
  departmentId: string
  name: string
  /** Veículos dentro (INSIDE). */
  occupied: number
  /** Vagas cadastradas. */
  capacity: number
}

/** Ocupação em tempo real (regra 21 — todos os veículos ocupam espaço). */
export interface OccupancyResponse {
  /** Veículos dentro no momento. */
  totalOccupied: number
  /** Capacidade total (soma das vagas dos departamentos ativos). */
  totalCapacity: number
  /** Vagas livres (capacidade − ocupação; mínimo 0). */
  freeSlots: number
  /** Ocupação por departamento ativo. */
  byDepartment: OccupancyDepartmentResponse[]
}

/** ViewModel de ocupação (porcentagens calculadas no client). */
export interface OccupancyDepartmentView {
  departmentId: string
  name: string
  occupied: number
  capacity: number
  /** Percentual de ocupação (0–100; `null` quando sem capacidade). */
  rate: number | null
}

export interface OccupancyViewModel {
  totalOccupied: number
  totalCapacity: number
  freeSlots: number
  /** Ocupação global (0–100; `null` quando sem capacidade). */
  totalRate: number | null
  byDepartment: OccupancyDepartmentView[]
}

/** Veículo resolvido pelo QR (GET /qr-codes/:code). */
export interface ResolvedVehicleQr {
  id: string
  plate: string
  model: string | null
  color: string | null
  freePass: boolean
  vehicleTypeId: string
  vehicleType: { id: string; code: string; name: string; isFleet: boolean } | null
  isActive: boolean
}

/** Payload do registro de entrada. */
export interface RegisterEntryPayload {
  plate: string
  accessRequestId?: string
  temporaryDriverName?: string
  /** Liberar mesmo com vaga cheia (confirmado pelo porteiro — 409). */
  overCapacity?: boolean
}

/** Payload do registro de saída. */
export interface RegisterExitPayload {
  plate: string
  temporaryDriverName?: string
}
