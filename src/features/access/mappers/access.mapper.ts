// Types
import type {
  AccessContextParams,
  AccessRecordsParams,
  AccessRequestPayload,
  AccessRequestType,
  EntryDenialReason,
  MovementSource,
  OccupancyDepartmentResponse,
  OccupancyDepartmentView,
  OccupancyResponse,
  OccupancyViewModel,
  RegisterDenialPayload,
  RegisterEntryPayload,
  RegisterEntryRequestPayload,
  RegisterExitPayload,
} from '../types/access.types'

// Utils
import { normalizePlate } from '../utils/plate'

// Schemas
import type { EntryFormValues, ExitFormValues } from '../schemas/portaria.schema'
import type { AccessRegistrationFormValues } from '../schemas/access-registration.schema'

/**
 * Percentual de ocupação (0–100), `null` quando não há capacidade
 * configurada (evita divisão por zero e "0% de 0 vagas").
 *
 * @param occupied Veículos dentro.
 * @param capacity Vagas cadastradas.
 * @returns Percentual ou `null`.
 */
export function getOccupancyRate(occupied: number, capacity: number): number | null {
  if (capacity <= 0) {
    return null
  }
  return Math.round((occupied / capacity) * 100)
}

/**
 * Converte os departamentos da resposta de ocupação no viewmodel (com o
 * percentual de cada um).
 *
 * Usado pelo painel de ocupação e pelo seletor de setor da ficha — este último
 * só aproveita `occupied`/`capacity`, mas monta o mesmo viewmodel para não
 * existirem duas formas de ler a mesma resposta.
 *
 * @param departments Ocupação por departamento (`byDepartment`).
 * @returns Departamentos com `rate` calculado.
 */
export function toOccupancyDepartmentViews(
  departments: OccupancyDepartmentResponse[],
): OccupancyDepartmentView[] {
  return departments.map((department) => ({
    departmentId: department.departmentId,
    name: department.name,
    occupied: department.occupied,
    capacity: department.capacity,
    rate: getOccupancyRate(department.occupied, department.capacity),
  }))
}

/**
 * Converte a resposta de ocupação no viewmodel da tela — adiciona o
 * percentual de cada departamento e o percentual global (para a barra de
 * progresso).
 *
 * @param response Resposta do `GET /access/occupancy`.
 * @returns ViewModel com `rate` por departamento e `totalRate`.
 */
export function toOccupancyViewModel(response: OccupancyResponse): OccupancyViewModel {
  return {
    totalOccupied: response.totalOccupied,
    totalCapacity: response.totalCapacity,
    freeSlots: response.freeSlots,
    totalRate: getOccupancyRate(response.totalOccupied, response.totalCapacity),
    byDepartment: toOccupancyDepartmentViews(response.byDepartment),
  }
}

/**
 * Campos que **não** vêm do formulário de entrada e sim da ficha/contexto da
 * portaria (motorista escolhido, setor confirmado, portaria do device...).
 */
export interface RegisterEntryExtras {
  /** Solicitação existente reaproveitada (`reusableRequestId` do contexto). */
  accessRequestId?: string | null
  /** Solicitação a criar junto com a entrada (exceção de cadastro/vínculo). */
  request?: RegisterEntryRequestPayload | null
  /** Motorista escolhido na ficha. */
  driverUserId?: string | null
  /** Setor confirmado na ficha. */
  departmentId?: string | null
  /** Portaria do dispositivo. */
  entranceId?: string | null
  /** Liberação confirmada com vaga cheia. */
  overCapacity?: boolean
  /** Origem do registro (quando a placa veio do QR). */
  source?: MovementSource
}

/**
 * Acrescenta a chave quando o valor existe (evita `undefined`/string vazia no
 * body).
 *
 * @param target Objeto em construção.
 * @param key Chave a preencher.
 * @param value Valor cru (string opcional).
 */
function setOptionalString<TObject extends object, TKey extends keyof TObject>(
  target: TObject,
  key: TKey,
  value: string | null | undefined,
): void {
  const trimmed = value?.trim()
  if (trimmed) {
    target[key] = trimmed as TObject[TKey]
  }
}

/**
 * Converte os valores do formulário de entrada no payload do
 * `POST /access/entry` — placa normalizada; campos vazios viram `undefined`.
 *
 * Os dados que o porteiro escolhe na ficha (motorista, setor, portaria,
 * confirmação de vaga cheia e o bloco `request` da exceção) entram por
 * `extras` — o formulário só coleta a placa e o condutor temporário. O
 * `accessRequestId` digitado no formulário antigo continua valendo como
 * fallback (a ficha nova usa o `reusableRequestId` do contexto).
 *
 * @param values Valores validados do formulário.
 * @param extras Dados resolvidos pela ficha da portaria.
 * @returns Payload de registro de entrada.
 */
export function toRegisterEntryPayload(
  values: EntryFormValues,
  extras: RegisterEntryExtras = {},
): RegisterEntryPayload {
  const payload: RegisterEntryPayload = {
    plate: normalizePlate(values.plate),
  }

  setOptionalString(payload, 'accessRequestId', extras.accessRequestId ?? values.accessRequestId)
  setOptionalString(payload, 'driverUserId', extras.driverUserId)
  setOptionalString(payload, 'departmentId', extras.departmentId)
  setOptionalString(payload, 'entranceId', extras.entranceId)
  setOptionalString(payload, 'temporaryDriverName', values.temporaryDriverName)

  if (extras.request) {
    payload.request = extras.request
  }
  if (extras.overCapacity) {
    payload.overCapacity = true
  }
  if (extras.source) {
    payload.source = extras.source
  }

  // `accessRequestId` e `request` são mutuamente exclusivos (400 no backend):
  // a solicitação existente tem precedência sobre a criação de uma nova.
  if (payload.accessRequestId) {
    delete payload.request
  }

  return payload
}

/**
 * Converte os valores do formulário de saída no payload do
 * `POST /access/exit` — placa normalizada; passageiro vazio vira `undefined`.
 *
 * @param values Valores validados do formulário.
 * @param entranceId Portaria do dispositivo (regra 61), quando escolhida.
 * @returns Payload de registro de saída.
 */
export function toRegisterExitPayload(
  values: ExitFormValues,
  entranceId?: string | null,
): RegisterExitPayload {
  const payload: RegisterExitPayload = {
    plate: normalizePlate(values.plate),
  }

  setOptionalString(payload, 'temporaryDriverName', values.temporaryDriverName)
  setOptionalString(payload, 'entranceId', entranceId)

  return payload
}

/** Campos coletados pelo formulário de impedimento (ticket 05). */
export interface RegisterDenialFormValues {
  plate: string
  reason: EntryDenialReason
  observation?: string
  /** Checkbox "solicitar bloqueio do veículo" (desmarcado por padrão). */
  requestBlock?: boolean
  /** Motivo do bloqueio pedido (pré-preenchido com a observação). */
  blockReason?: string
}

/**
 * Converte o formulário de impedimento no payload do `POST /entry-denials`.
 *
 * Regras do contrato:
 *
 * - `observation` só vai quando preenchida (obrigatória apenas em `OTHER` — o
 *   schema do formulário barra o submit sem ela);
 * - `blockReason` só é enviado quando o bloqueio foi **pedido** (não adianta
 *   mandar o motivo sem `requestBlock`);
 * - `vehicleId`/`entranceId`/`blockId` vêm do contexto/portaria, não do
 *   formulário.
 *
 * @param values Valores validados do formulário.
 * @param extras Dados resolvidos pelo contexto da portaria.
 * @returns Payload de registro de impedimento.
 */
export function toRegisterDenialPayload(
  values: RegisterDenialFormValues,
  extras: {
    vehicleId?: string | null
    entranceId?: string | null
    blockId?: string | null
  } = {},
): RegisterDenialPayload {
  const payload: RegisterDenialPayload = {
    plate: normalizePlate(values.plate),
    reason: values.reason,
  }

  setOptionalString(payload, 'observation', values.observation)
  setOptionalString(payload, 'vehicleId', extras.vehicleId)
  setOptionalString(payload, 'entranceId', extras.entranceId)
  setOptionalString(payload, 'blockId', extras.blockId)

  if (values.requestBlock) {
    payload.requestBlock = true
    setOptionalString(payload, 'blockReason', values.blockReason)
  }

  return payload
}

/**
 * Converte o formulário da exceção no bloco `request` do `POST /access/entry`.
 *
 * O `type` já vem **derivado** do contexto (`deriveRegistrationScenario`), e o
 * bloco só leva o que o cenário cria:
 *
 * - condutor novo (`NEW_USER`/`BOTH`): `payload.driver` com nome/e-mail/
 *   documento/telefone + `userType` (o aceite cria a pessoa — ADR 0013);
 * - condutor existente: nada de motorista (o `driverUserId` vai no payload da
 *   entrada, que é quem o servidor usa para achar a pessoa);
 * - veículo novo (`NEW_VEHICLE`/`BOTH`): `payload.vehicle` com modelo/cor;
 * - `contactPhone` em todos os cenários **menos** `LINK` (regra 43).
 *
 * @param values Valores validados do formulário.
 * @param params Cenário derivado e setor confirmado na ficha.
 * @returns Bloco `request` do registro de entrada.
 */
export function toRegisterRequestBlock(
  values: AccessRegistrationFormValues,
  params: { type: AccessRequestType; departmentId?: string | null },
): RegisterEntryRequestPayload {
  const createsDriver = params.type === 'NEW_USER' || params.type === 'BOTH'
  const createsVehicle = params.type === 'NEW_VEHICLE' || params.type === 'BOTH'

  const payload: AccessRequestPayload = {}

  if (createsDriver) {
    payload.driver = {
      name: values.driverName?.trim() || undefined,
      email: values.driverEmail?.trim() || undefined,
      document: values.driverDocument?.trim() || null,
      phone: values.driverPhone?.trim() || null,
    }
  }

  if (createsVehicle) {
    payload.vehicle = {
      model: values.vehicleModel?.trim() || undefined,
      color: values.vehicleColor?.trim() || undefined,
    }
  }

  const block: RegisterEntryRequestPayload = {
    type: params.type,
    payload,
  }

  if (createsDriver) {
    block.userType = values.userType
  }
  if (params.type !== 'LINK') {
    block.contactPhone = values.contactPhone?.trim() || undefined
  }
  if (params.departmentId) {
    block.departmentId = params.departmentId
  }

  return block
}

/**
 * Monta a query do contexto/veredito (`GET /access/context`) com os parâmetros
 * preenchidos.
 *
 * @param params Placa + busca/setor/motorista escolhido.
 * @returns Query string (sem o `?`).
 */
export function buildAccessContextQuery(params: AccessContextParams): string {
  const search = new URLSearchParams()
  search.set('plate', normalizePlate(params.plate))

  if (params.search) {
    search.set('search', params.search)
  }
  if (params.departmentId) {
    search.set('departmentId', params.departmentId)
  }
  if (params.driverUserId) {
    search.set('driverUserId', params.driverUserId)
  }

  return search.toString()
}

/** Registros por página quando o consumidor não informa (default do backend). */
export const ACCESS_RECORDS_DEFAULT_LIMIT = 20

/**
 * Monta a query do feed de registros (`GET /access/records`).
 *
 * Sem ordenação: o servidor já devolve `occurredAt DESC` (ADR 0015) — enviar
 * `sorting` só duplicaria a decisão.
 *
 * @param params Filtros + paginação.
 * @returns Query string (sem o `?`).
 */
export function buildAccessRecordsQuery(params: AccessRecordsParams): string {
  const search = new URLSearchParams()

  if (params.kind) {
    search.set('kind', params.kind)
  }
  if (params.plate) {
    search.set('plate', normalizePlate(params.plate))
  }
  if (params.dateFrom) {
    search.set('dateFrom', params.dateFrom)
  }
  if (params.dateTo) {
    search.set('dateTo', params.dateTo)
  }
  if (params.entranceId) {
    search.set('entranceId', params.entranceId)
  }
  if (params.doormanId) {
    search.set('doormanId', params.doormanId)
  }

  search.set('limit', String(params.limit ?? ACCESS_RECORDS_DEFAULT_LIMIT))
  search.set('offset', String(params.offset ?? 0))

  return search.toString()
}

/**
 * Converte o período do filtro (dias `yyyy-mm-dd`) no par ISO esperado pelo
 * feed.
 *
 * O `dateTo` do backend é **inclusivo**, então o fim do dia
 * (`23:59:59.999` local) entra no intervalo — sem isso, os registros do próprio
 * dia final ficariam de fora.
 *
 * @param from Dia inicial (`yyyy-mm-dd`) ou vazio.
 * @param to Dia final (`yyyy-mm-dd`) ou vazio.
 * @returns `{ dateFrom, dateTo }` em ISO (chaves omitidas quando vazias).
 */
export function toIsoDayRange(
  from?: string | null,
  to?: string | null,
): { dateFrom?: string; dateTo?: string } {
  const range: { dateFrom?: string; dateTo?: string } = {}

  if (from) {
    const start = new Date(`${from}T00:00:00.000`)
    if (!Number.isNaN(start.getTime())) {
      range.dateFrom = start.toISOString()
    }
  }

  if (to) {
    const end = new Date(`${to}T23:59:59.999`)
    if (!Number.isNaN(end.getTime())) {
      range.dateTo = end.toISOString()
    }
  }

  return range
}
