/**
 * Tipos do fluxo de acesso (espelho das respostas do backend — ADR 0010).
 *
 * A portaria web consome `POST /access/entry`, `POST /access/exit`,
 * `GET /access/open`, `GET /access/context`, `GET /access/records`,
 * `POST /entry-denials` e `GET /qr-codes/:code` (resolução de QR).
 */

// ─── Contrato de solicitação (espelho local) ────────────────────────────────
// O bloco `request` da entrada e a ficha exibem dados de `access_request`. As
// features não podem se importar (AGENTS.md §2), então as uniões do contrato
// são redeclaradas aqui — mesmo padrão do espelho de `EntryDenialReason`.

/** Cenários de solicitação de acesso. */
export type AccessRequestType = 'NEW_USER' | 'NEW_VEHICLE' | 'LINK' | 'BOTH'

/** Situação de uma solicitação. */
export type AccessRequestStatus = 'PENDING' | 'IN_CONTACT' | 'REGISTERED' | 'REJECTED' | 'CANCELLED'

/** Tipo do motorista a criar na solicitação (Colaborador/Visitante). */
export type AccessRequestUserType = 'EMPLOYEE' | 'VISITOR'

/** Dados do motorista/veículo enviados no `payload` (jsonb). */
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

/** Origem do movimento (espelho do backend — M4). */
export type MovementSource = 'PLATE' | 'QRCODE' | 'APP' | 'MANUAL' | 'INITIAL' | 'WEB'

/** Tipo de movimento (ledger imutável). */
export type MovementType = 'ENTRY' | 'EXIT'

/** Situação de uma visita. */
export type AccessStatus = 'INSIDE' | 'OUT' | 'NO_EXIT' | 'MANUAL_CLOSED'

/** Status de sincronização do movimento (offline). */
export type SyncStatus = 'PENDING' | 'SYNCED'

/** Motivo do impedimento de entrada. */
export type EntryDenialReason =
  'BLOCKED' | 'UNREGISTERED' | 'UNAUTHORIZED_DRIVER' | 'OVERDUE' | 'OTHER'

/**
 * Veredito único da entrada (ADR 0014 §3) — o servidor decide, o cliente exibe.
 *
 * `ALLOW_*` liberam (com as ressalvas das flags de requisito do contexto);
 * `DENY_*` impedem.
 */
export type AccessVerdict =
  | 'ALLOW'
  | 'ALLOW_WITH_REQUEST'
  | 'ALLOW_OVER_CAPACITY'
  | 'ALLOW_FORCED_REENTRY'
  | 'DENY_BLOCKED'
  | 'DENY_OVERDUE'
  | 'DENY_INACTIVE'

/**
 * Motivos que compõem o veredito (o cliente usa para escolher o rótulo fino —
 * ex.: `ALLOW` + `FREE_PASS` é "passe livre", `ALLOW` + `DRIVER_ALLOWED` é
 * "motorista autorizado").
 */
export type AccessVerdictReason =
  | 'BLOCKED'
  | 'INACTIVE'
  | 'FREE_PASS'
  | 'DRIVER_ALLOWED'
  | 'REENTRY'
  | 'REQUEST_OPEN'
  | 'REQUEST_OVERDUE'
  | 'REQUEST_PRE_AUTHORIZED'
  | 'UNREGISTERED_VEHICLE'
  | 'UNREGISTERED_DRIVER'
  | 'DRIVER_NOT_ALLOWED'
  | 'CAPACITY_FULL'

/** Tipo de bloqueio ativo (`MANUAL` da administração / `AUTOMATIC` futuro). */
export type VehicleBlockType = 'MANUAL' | 'AUTOMATIC'

/** Tipo de registro no feed da portaria (ADR 0015). */
export type AccessRecordKind = 'ENTRY' | 'EXIT' | 'DENIAL'

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

/** Resumo do tipo de veículo (agregado nas respostas de veículo). */
export interface VehicleTypeSummary {
  id: string
  code: string
  name: string
  isFleet: boolean
}

/** Veículo da ficha de contexto (o que o porteiro confere no balcão). */
export interface AccessContextVehicle {
  id: string
  plate: string
  model: string | null
  color: string | null
  vehicleTypeId: string
  vehicleType: VehicleTypeSummary | null
  freePass: boolean
  isActive: boolean
  /** Derivado do bloqueio ativo (regra 17). */
  isBlocked: boolean
}

/** Bloqueio ativo que motiva uma negativa (regra 2). */
export interface AccessContextBlock {
  id: string
  reason: string
  blockType: VehicleBlockType
  blockedAt: string
}

/** Setor considerado na ficha + ocupação **do setor escolhido**. */
export interface AccessContextDepartment {
  /** Setor considerado pelo contexto. */
  id: string | null
  /** Nome do setor considerado (`null` = vagas livres). */
  name: string | null
  /** Setor padrão ativo do veículo (pré-seleção). */
  defaultId: string | null
  /** Nome do setor padrão. */
  defaultName: string | null
  /** Vagas cadastradas (0 = sem capacidade configurada). */
  capacity: number
  /** Veículos dentro (INSIDE) no setor. */
  occupied: number
  /** Há vaga livre (ou não há capacidade configurada). */
  hasFreeSlot: boolean
}

/** Motorista na ficha: vinculado ao veículo ou sugestão da empresa. */
export interface AccessContextDriver {
  id: string
  name: string
  /** Vinculado ao veículo? */
  linked: boolean
  /** Autorizado a dirigir (`can_drive`). */
  canDrive: boolean
  /** Proprietário principal (1 por veículo). */
  isPrimary: boolean
}

/** Motoristas da ficha — vinculados (até 3) e sugestões (até 3, com busca). */
export interface AccessContextDrivers {
  linked: AccessContextDriver[]
  suggestions: AccessContextDriver[]
  /** Busca aplicada (eco). */
  search: string | null
}

/** Solicitação da placa exibida na ficha (as últimas, qualquer status). */
export interface AccessContextRequest {
  id: string
  type: AccessRequestType
  status: AccessRequestStatus
  requestedAt: string
  /** Pré-autorizada pela administração (sobrepõe o prazo — ADR 0014 §1). */
  entryAuthorized: boolean
  /** Nome do motorista informado no `payload` (quando houver). */
  driverName: string | null
  /** Vencida pelas regras 38/39 (`PENDING` > 3d; `IN_CONTACT` > 7d). */
  isOverdue: boolean
  /** Dias corridos desde a solicitação (para o texto "há N dias"). */
  daysSinceRequest: number
  /** Prazo-limite vigente (ISO) ou `null` para status sem prazo. */
  deadline: string | null
}

/** Acesso aberto (`INSIDE`) da placa — reentrada e conferência de saída. */
export interface AccessContextOpenAccess {
  id: string
  entryAt: string | null
  driver: { id: string | null; name: string | null }
  departmentId: string | null
  overCapacity: boolean
}

/**
 * Contexto + veredito da placa (`GET /access/context`) — a ficha inteira da
 * portaria em uma chamada.
 *
 * O cliente **não recalcula regra alguma**: exibe `verdict`/`reasons` e usa as
 * flags de requisito (`requiresRequest`, `reusableRequestId`,
 * `requiresOverCapacity`, `isReentry`) para montar o `POST /access/entry`.
 */
export interface AccessContextResponse {
  /** Placa consultada (normalizada). */
  plate: string
  /** Decisão única do servidor. */
  verdict: AccessVerdict
  /** Motivos que compõem o veredito. */
  reasons: AccessVerdictReason[]
  /** A entrada exige criar/reaproveitar solicitação (bloco `request`). */
  requiresRequest: boolean
  /**
   * Solicitação existente que pode ser **referenciada** (`accessRequestId`) em
   * vez de criar uma nova; `null` = criar (`request`).
   */
  reusableRequestId: string | null
  /** A entrada exige confirmação `overCapacity` (409 sem ela). */
  requiresOverCapacity: boolean
  /** Já existe acesso aberto (a saída anterior será encerrada — regra 9). */
  isReentry: boolean
  /** Veículo cadastrado (`null` = placa desconhecida). */
  vehicle: AccessContextVehicle | null
  /** Bloqueio ativo (`null` se não houver). */
  block: AccessContextBlock | null
  /** Setor considerado + ocupação. */
  department: AccessContextDepartment
  /** Motoristas vinculados e sugestões. */
  drivers: AccessContextDrivers
  /** Últimas solicitações da placa (qualquer status). */
  requests: AccessContextRequest[]
  /** Acessos abertos da placa. */
  openAccesses: AccessContextOpenAccess[]
}

/** Parâmetros da consulta de contexto/veredito. */
export interface AccessContextParams {
  /** Placa lida/digitada na portaria. */
  plate: string
  /** Busca de motorista (nome/telefone/documento) — habilita as sugestões. */
  search?: string
  /** Setor para o qual a ocupação é avaliada (default: padrão do veículo). */
  departmentId?: string
  /** Motorista escolhido na ficha — o veredito passa a refletir **ele**. */
  driverUserId?: string
}

/** Registro do feed da portaria (`GET /access/records` — ADR 0015). */
export interface AccessRecord {
  /** Id do registro no ledger de origem. */
  id: string
  kind: AccessRecordKind
  /** Placa lida no momento (snapshot). */
  plate: string
  /** Condutor identificado ou nome temporário. */
  driverName: string | null
  /** Modelo do veículo (quando cadastrado). */
  vehicleModel: string | null
  /** Departamento confirmado no momento. */
  departmentName: string | null
  /** Portaria do device que registrou. */
  entranceName: string | null
  /** Porteiro que registrou. */
  doormanName: string | null
  /** Motivo do impedimento (apenas em `DENIAL`). */
  reason: EntryDenialReason | null
  /** Observação do impedimento (apenas em `DENIAL`). */
  observation: string | null
  /** Momento real do evento (ISO). */
  occurredAt: string
  /** Acesso (`vehicle_access`) vinculado, quando houver. */
  accessId: string | null
}

/** Portaria ativa devolvida em `parameters` do feed (chave `entrance_id`). */
export interface AccessRecordEntranceOption {
  id: string
  name: string
}

/** Metadado de filtro da listagem (formato padrão de `parameters`). */
export interface AccessRecordListParameter {
  key: string
  label: string
  allowed_values?: AccessRecordEntranceOption[]
}

/** Envelope paginado do feed (com as portarias ativas do filtro). */
export interface AccessRecordsResponse {
  limit: number
  offset: number
  data: AccessRecord[]
  count: number
  /**
   * Metadados de filtro — as portarias **ativas** vêm na chave `entrance_id`
   * (o porteiro não tem `MANAGE_ENTRANCES` para chamar `/entrances`).
   */
  parameters?: AccessRecordListParameter[]
}

/** Parâmetros de listagem do feed (server-side). */
export interface AccessRecordsParams {
  kind?: AccessRecordKind
  /** Placa (parcial). */
  plate?: string
  /** Início do período (ISO). */
  dateFrom?: string
  /** Fim do período (ISO — inclui o fim do dia). */
  dateTo?: string
  entranceId?: string
  doormanId?: string
  /** Registros por página (default do backend: 20). */
  limit?: number
  /** Offset da página (default do backend: 0). */
  offset?: number
}

/** Bloco `request` da entrada: cria a solicitação junto (ADR 0014 §5). */
export interface RegisterEntryRequestPayload {
  type: AccessRequestType
  userType?: AccessRequestUserType
  payload?: AccessRequestPayload
  contactPhone?: string
  departmentId?: string
}

/** Payload do registro de entrada. */
export interface RegisterEntryPayload {
  plate: string
  /** Solicitação existente reaproveitada (`reusableRequestId` — não com `request`). */
  accessRequestId?: string
  /** Solicitação a **criar** junto com a entrada (exceção de cadastro/vínculo). */
  request?: RegisterEntryRequestPayload
  /** Motorista escolhido na ficha (aceito sem vínculo no cenário `LINK`). */
  driverUserId?: string
  temporaryDriverName?: string
  departmentId?: string
  /** Liberar mesmo com vaga cheia (confirmado pelo porteiro — 409). */
  overCapacity?: boolean
  /** Portaria do dispositivo (regra 61). */
  entranceId?: string
  /** Origem do registro (QR lido na portaria). */
  source?: MovementSource
}

/** Payload do registro de saída. */
export interface RegisterExitPayload {
  plate: string
  temporaryDriverName?: string
  /** Condutor escolhido (usado quando não há entrada registrada — NO_EXIT). */
  driverUserId?: string
  /** Portaria do dispositivo (regra 61). */
  entranceId?: string
  /** Origem do registro (QR lido na portaria). */
  source?: MovementSource
}

/** Payload do registro de impedimento (`POST /entry-denials`). */
export interface RegisterDenialPayload {
  plate: string
  reason: EntryDenialReason
  /** Obrigatória apenas em `OTHER` (400 sem ela). */
  observation?: string
  /** Veículo resolvido pelo contexto (quando a placa está cadastrada). */
  vehicleId?: string
  /** Portaria do dispositivo (regra 61). */
  entranceId?: string
  /** Bloqueio ativo que motivou (quando houver). */
  blockId?: string
  /** Pedir o bloqueio do veículo no mesmo fluxo (exige `CREATE_BLOCK_REQUEST`). */
  requestBlock?: boolean
  /** Motivo do bloqueio pedido (default: a observação). */
  blockReason?: string
}

/** Situação de uma solicitação de bloqueio. */
export type BlockRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

/** Pedido de bloqueio criado junto com o impedimento. */
export interface EntryDenialBlockRequest {
  id: string
  plate: string
  status: BlockRequestStatus
}

/**
 * Resposta do registro de impedimento — o impedimento **mais** o resultado do
 * pedido de bloqueio (campos aditivos, não envelope).
 */
export interface RegisterDenialResponse extends EntryDenialResponse {
  /** Solicitação de bloqueio criada (`null` quando não pedida). */
  blockRequest: EntryDenialBlockRequest | null
  /**
   * Motivo pelo qual o pedido de bloqueio não foi criado (ex.: já existe
   * pendente). O impedimento **permanece** registrado.
   */
  blockRequestError: string | null
}

/** Acesso aberto (conferência na saída) — ficha enriquecida na resposta. */
export interface OpenAccessResponse {
  id: string
  vehicleId: string | null
  temporaryPlate: string | null
  driver: { id: string | null; name: string | null; phone: string | null }
  departmentId: string | null
  departmentName: string | null
  /** `null` quando a entrada foi de **placa temporária**. */
  vehicle: AccessFichaVehicle | null
  entryAt: string | null
  overCapacity: boolean
}

/** Veículo da ficha de conferência (entrada/saída). */
export interface AccessFichaVehicle {
  id: string
  plate: string
  model: string | null
  color: string | null
  vehicleType: VehicleTypeSummary | null
  freePass: boolean
}

/** Condutor da ficha de conferência (entrada/saída). */
export interface AccessFichaDriver {
  id: string | null
  name: string | null
  phone: string | null
}

/** Visita + movimento (entrada registrada, saída registrada, reentrada). */
export interface ClosedAccessResponse {
  access: AccessResponse
  movement: MovementResponse
  /** Ficha de quem entrou/saiu (ticket 05 do backend). */
  driver: AccessFichaDriver | null
  departmentName: string | null
  vehicle: AccessFichaVehicle | null
}

/** Impedimento de entrada registrado automaticamente. */
export interface EntryDenialResponse {
  id: string
  /** Placa lida no momento (snapshot). */
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
