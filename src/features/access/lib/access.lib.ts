// Types
import type {
  AccessRecordEntranceOption,
  AccessRecordListParameter,
  AccessRequestType,
  AccessVerdict,
  AccessVerdictReason,
  EntryDenialReason,
} from '../types/access.types'

// Shared
import { PermissionCode } from '#/shared/enum/permission-code'

/**
 * Mapeia o motivo do impedimento para a chave de tradução do namespace
 * `access` (ex.: `BLOCKED` → `denial.reasons.BLOCKED`).
 *
 * @param reason Motivo devolvido pelo backend.
 * @returns Chave i18n.
 */
export function getDenialReasonLabelKey(reason: EntryDenialReason): string {
  return `denial.reasons.${reason}`
}

/**
 * Combinações veredito × motivo que têm texto **próprio** na ficha (ex.:
 * `ALLOW` por passe livre não é o mesmo "liberado" de `ALLOW` por motorista
 * autorizado). As demais combinações usam o rótulo genérico do veredito.
 */
const VERDICT_REASON_LABEL_KEYS: Partial<Record<AccessVerdict, AccessVerdictReason[]>> = {
  ALLOW: ['FREE_PASS', 'DRIVER_ALLOWED'],
  ALLOW_WITH_REQUEST: [
    'REQUEST_OPEN',
    'REQUEST_PRE_AUTHORIZED',
    'DRIVER_NOT_ALLOWED',
    'UNREGISTERED_VEHICLE',
    'UNREGISTERED_DRIVER',
  ],
  ALLOW_OVER_CAPACITY: ['CAPACITY_FULL'],
  ALLOW_FORCED_REENTRY: ['REENTRY'],
  DENY_BLOCKED: ['BLOCKED'],
  DENY_OVERDUE: ['REQUEST_OVERDUE'],
  DENY_INACTIVE: ['INACTIVE'],
}

/**
 * Chave i18n do rótulo do veredito na ficha.
 *
 * Com um motivo que refine o veredito (ex.: `ALLOW` + `FREE_PASS`), devolve a
 * chave específica (`verdict.reasons.ALLOW.FREE_PASS`); sem motivo — ou com um
 * motivo que não muda o texto —, a chave genérica (`verdict.labels.ALLOW`).
 *
 * @param verdict Veredito devolvido pelo servidor.
 * @param reason Motivo (primeiro) do veredito, quando houver.
 * @returns Chave i18n do namespace `access`.
 */
export function getVerdictLabelKey(
  verdict: AccessVerdict,
  reason?: AccessVerdictReason | null,
): string {
  if (reason && VERDICT_REASON_LABEL_KEYS[verdict]?.includes(reason)) {
    return `verdict.reasons.${verdict}.${reason}`
  }
  return `verdict.labels.${verdict}`
}

/**
 * Chave i18n do **nome genérico** de um motivo do veredito (as chips da ficha).
 *
 * Diferente de `getVerdictLabelKey`, que devolve o rótulo **refinado** do par
 * veredito × motivo: aqui o motivo é exibido solto (ex.: "Vaga cheia" junto do
 * rótulo "Sem vaga no setor").
 *
 * @param reason Motivo devolvido pelo servidor.
 * @returns Chave i18n do namespace `access`.
 */
export function getVerdictReasonNameKey(reason: AccessVerdictReason): string {
  return `verdict.reasonNames.${reason}`
}

/** Tom visual do veredito (`success` libera, `warning` pede atenção, `destructive` nega). */
export type VerdictTone = 'success' | 'warning' | 'destructive'

/**
 * Tom do card do veredito.
 *
 * `ALLOW` é sucesso; `ALLOW_WITH_REQUEST`, `ALLOW_OVER_CAPACITY` e
 * `ALLOW_FORCED_REENTRY` liberam mas exigem ação/atenção do porteiro (âmbar);
 * os `DENY_*` são impedimentos (vermelho).
 *
 * @param verdict Veredito devolvido pelo servidor.
 * @returns Tom visual.
 */
export function verdictTone(verdict: AccessVerdict): VerdictTone {
  if (verdict.startsWith('DENY')) {
    return 'destructive'
  }
  return verdict === 'ALLOW' ? 'success' : 'warning'
}

/**
 * O veredito libera a entrada?
 *
 * Atenção: `true` **não** significa "registrar direto" — as flags do contexto
 * (`requiresOverCapacity`, `isReentry`) e a exceção (`requiresRequest`) podem
 * exigir confirmação/dados extras antes de enviar.
 *
 * @param verdict Veredito devolvido pelo servidor.
 * @returns `true` para os vereditos `ALLOW_*`.
 */
export function isVerdictAllow(verdict: AccessVerdict): boolean {
  return verdict.startsWith('ALLOW')
}

/**
 * Motivo de impedimento sugerido pela negativa do veredito.
 *
 * `DENY_BLOCKED` e `DENY_OVERDUE` têm motivo próprio; os demais (veículo
 * inativo, placa desconhecida) caem em `OTHER`, cuja observação é obrigatória.
 *
 * @param verdict Veredito devolvido pelo servidor.
 * @returns Motivo do impedimento.
 */
export function denialReasonFromVerdict(verdict: AccessVerdict): EntryDenialReason {
  if (verdict === 'DENY_BLOCKED') {
    return 'BLOCKED'
  }
  if (verdict === 'DENY_OVERDUE') {
    return 'OVERDUE'
  }
  return 'OTHER'
}

/**
 * O usuário tem uma permissão do catálogo?
 *
 * @param permissions Permissões da sessão ("permissionCodes").
 * @param permission Permissão exigida.
 * @returns `true` quando a permissão está presente.
 */
function hasPermission(permissions: string[] | undefined, permission: PermissionCode): boolean {
  return permissions?.includes(permission) ?? false
}

/**
 * Pode registrar entrada? (menu/ação da portaria — `REGISTER_ENTRY`)
 *
 * @param permissions Permissões da sessão.
 * @returns `true` quando autorizado.
 */
export function canRegisterEntry(permissions: string[] | undefined): boolean {
  return hasPermission(permissions, PermissionCode.REGISTER_ENTRY)
}

/**
 * Pode registrar saída? (`REGISTER_EXIT`)
 *
 * @param permissions Permissões da sessão.
 * @returns `true` quando autorizado.
 */
export function canRegisterExit(permissions: string[] | undefined): boolean {
  return hasPermission(permissions, PermissionCode.REGISTER_EXIT)
}

/**
 * Pode registrar impedimento? (`REGISTER_DENIAL`)
 *
 * @param permissions Permissões da sessão.
 * @returns `true` quando autorizado.
 */
export function canRegisterDenial(permissions: string[] | undefined): boolean {
  return hasPermission(permissions, PermissionCode.REGISTER_DENIAL)
}

/**
 * Pode **pedir o bloqueio** de um veículo? (`CREATE_BLOCK_REQUEST`)
 *
 * O impedimento não exige essa permissão: quem impede pode não poder pedir o
 * bloqueio — o pedido dentro do impedimento exige `CREATE_BLOCK_REQUEST`
 * (403 no backend), então o checkbox só aparece com ela.
 *
 * @param permissions Permissões da sessão.
 * @returns `true` quando autorizado.
 */
export function canRequestBlock(permissions: string[] | undefined): boolean {
  return hasPermission(permissions, PermissionCode.CREATE_BLOCK_REQUEST)
}

/** Chave do metadado de portarias na listagem (`parameters`). */
export const ENTRANCE_PARAMETER_KEY = 'entrance_id'

/**
 * Extrai as portarias **ativas** dos metadados da listagem.
 *
 * O backend devolve as portarias em `parameters` justamente para o balcão não
 * precisar de `MANAGE_ENTRANCES` (o porteiro não tem essa permissão).
 *
 * @param parameters `parameters` do envelope de listagem.
 * @returns Portarias ativas (vazio quando o metadado não vem).
 */
export function getRecordEntranceOptions(
  parameters: AccessRecordListParameter[] | undefined,
): AccessRecordEntranceOption[] {
  return (
    parameters?.find((parameter) => parameter.key === ENTRANCE_PARAMETER_KEY)?.allowed_values ?? []
  )
}

/**
 * Resolve qual portaria o feed deve filtrar.
 *
 * Precedência: a escolha explícita do filtro na URL > a portaria do
 * dispositivo > nenhuma (todas as portarias). Na URL, `all` é o sentinela de
 * "todas" — e ele **vence** a portaria do dispositivo, senão o porteiro não
 * conseguiria ver o movimento das outras portarias.
 *
 * @param searchValue Valor de `entranceId` na URL (`id`, `all` ou vazio).
 * @param deviceEntranceId Portaria gravada no dispositivo.
 * @returns Id da portaria a filtrar, ou `undefined` (sem filtro).
 */
export function resolveEntranceFilter(
  searchValue: string | undefined,
  deviceEntranceId: string | null,
): string | undefined {
  if (searchValue === ALL_FILTER) {
    return undefined
  }
  return searchValue ?? deviceEntranceId ?? undefined
}

/**
 * Sentinela de "todos" nos filtros (aparece na URL).
 *
 * Vale para qualquer filtro de lista (tipo de registro, portaria) — o valor é
 * o mesmo porque, na URL, "todos" significa "sem filtro".
 */
export const ALL_FILTER = 'all'

/**
 * Sentinela de "sem seleção" nos selects (o Radix não aceita string vazia).
 *
 * Compartilhado pelos dois selects com valor anulável — o setor da entrada e a
 * portaria do dispositivo — para não ficarem dois literais soltos.
 */
export const NO_SELECTION_VALUE = 'none'

/**
 * Cenário da solicitação que o registro da portaria vai criar (regra 41).
 *
 * Derivado do que **existe** — nunca escolhido pelo porteiro:
 *
 * - veículo cadastrado + condutor já cadastrado → `LINK` (só falta o vínculo);
 * - veículo cadastrado + condutor novo → `NEW_USER`;
 * - veículo novo + condutor já cadastrado → `NEW_VEHICLE`;
 * - os dois novos → `BOTH`.
 *
 * @param params Existência do veículo (pela placa) e do condutor.
 * @returns Cenário da solicitação.
 */
export function deriveRegistrationScenario({
  hasVehicle,
  isNewDriver,
}: {
  hasVehicle: boolean
  isNewDriver: boolean
}): AccessRequestType {
  if (hasVehicle) {
    return isNewDriver ? 'NEW_USER' : 'LINK'
  }
  return isNewDriver ? 'BOTH' : 'NEW_VEHICLE'
}

/**
 * A entrada precisa criar a solicitação junto (bloco `request`)?
 *
 * Sim quando o porteiro está **cadastrando** o condutor/veículo (exceção
 * pedida por ele) ou quando o veredito exige solicitação e não há uma aberta
 * para reaproveitar — nesse caso a entrada manda `accessRequestId` em vez do
 * bloco `request`.
 *
 * @param params Exceção pedida pelo porteiro + flags da ficha.
 * @returns `true` quando o payload deve levar o bloco `request`.
 */
export function needsRequestBlock({
  isNewDriver,
  requiresRequest,
  reusableRequestId,
}: {
  isNewDriver: boolean
  requiresRequest: boolean | undefined
  reusableRequestId: string | null | undefined
}): boolean {
  return isNewDriver || (!!requiresRequest && !reusableRequestId)
}

/**
 * Tom da barra de ocupação conforme o percentual.
 *
 * - `null`: sem capacidade configurada (barra neutra);
 * - `safe`: até 79% (verde);
 * - `warning`: 80–100% (âmbar);
 * - `danger`: acima de 100% (excedendo a capacidade — vermelho).
 */
export type OccupancyTone = 'safe' | 'warning' | 'danger'

export function getOccupancyTone(rate: number | null): OccupancyTone | null {
  if (rate === null) {
    return null
  }
  if (rate > 100) {
    return 'danger'
  }
  if (rate >= 80) {
    return 'warning'
  }
  return 'safe'
}

/**
 * Formata um instante ISO em data/hora local (ex.: `21/08/2026 14:30`).
 *
 * Valores `null`/vazios devolvem `'—'` (traço) para a UI não exibir
 * "undefined".
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
