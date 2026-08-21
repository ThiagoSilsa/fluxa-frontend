// Types
import type {
  AccessRequestListParams,
  AccessRequestPayload,
  CreateAccessRequestPayload,
} from '../types/access-requests.types'

// Utils
import { normalizePlate } from '../utils/plate'

// Schemas
import type { AccessRequestFormValues } from '../schemas/access-request.schema'

/**
 * Monta os dados do motorista do payload (só quando há algum campo
 * preenchido — cenários NEW_USER/BOTH).
 */
function buildDriverPayload(values: AccessRequestFormValues) {
  const name = values.driverName?.trim()
  const email = values.driverEmail?.trim()
  const document = values.driverDocument?.trim()
  const phone = values.driverPhone?.trim()

  if (!name && !email && !document && !phone) {
    return undefined
  }
  return {
    name: name || undefined,
    email: email || undefined,
    document: document || undefined,
    phone: phone || undefined,
  }
}

/**
 * Monta os dados do veículo do payload (só quando há algum campo preenchido —
 * cenários NEW_VEHICLE/BOTH).
 */
function buildVehiclePayload(values: AccessRequestFormValues) {
  const model = values.vehicleModel?.trim()
  const color = values.vehicleColor?.trim()

  if (!model && !color) {
    return undefined
  }
  return { model: model || undefined, color: color || undefined }
}

/**
 * Converte os valores do formulário no payload de criação —
 * `POST /access-requests`.
 *
 * Placa normalizada; campos vazios viram `undefined`; o `payload` (jsonb)
 * só é enviado quando há dados do motorista/veículo a criar.
 *
 * @param values Valores validados do formulário.
 * @returns Payload de criação.
 */
export function toCreateAccessRequestPayload(
  values: AccessRequestFormValues,
): CreateAccessRequestPayload {
  const payload: CreateAccessRequestPayload = {
    plate: normalizePlate(values.plate),
    type: values.type,
  }

  if (values.vehicleId) {
    payload.vehicleId = values.vehicleId
  }
  if (values.userId) {
    payload.userId = values.userId
  }

  const contactPhone = values.contactPhone?.trim()
  if (contactPhone) {
    payload.contactPhone = contactPhone
    // Sem canal explícito, assume WhatsApp (regra 43 — telefone de contato).
    payload.contactChannel = values.contactChannel ?? 'WHATSAPP'
  } else if (values.contactChannel) {
    payload.contactChannel = values.contactChannel
  }

  const driver = buildDriverPayload(values)
  const vehicle = buildVehiclePayload(values)
  if (driver || vehicle) {
    const data: AccessRequestPayload = {}
    if (driver) {
      data.driver = driver
    }
    if (vehicle) {
      data.vehicle = vehicle
    }
    payload.payload = data
  }

  return payload
}

/**
 * Monta a query de listagem de solicitações (server-side — espelho do
 * `buildVehicleListQuery`).
 *
 * @param params Filtros e paginação.
 * @returns Query string (`status=...&plate=...&limit=...&offset=...`).
 */
export function buildAccessRequestListQuery(params: AccessRequestListParams): string {
  const search = new URLSearchParams()
  if (params.status) {
    search.set('status', params.status)
  }
  if (params.plate) {
    search.set('plate', params.plate)
  }
  search.set('limit', String(params.limit))
  search.set('offset', String(params.offset))
  return search.toString()
}
