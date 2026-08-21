// Schemas
import type { VehicleTypeFormValues } from '../schemas/vehicle-type.schema'

// Types
import type {
  CreateVehicleTypePayload,
  UpdateVehicleTypePayload,
  VehicleTypeEntity,
  VehicleTypeListParams,
} from '../types/vehicle-types.types'

/**
 * Normaliza os valores padrão do formulário de tipo de veículo.
 * Com entidade (edição) preenche com os dados existentes; sem ela, vazio
 * (criação nasce ativa e sem classificação de frota).
 *
 * @param vehicleType Entidade opcional (modo edição).
 * @returns Valores padrão para o formulário.
 */
export function normalizeVehicleTypeFormDefaults(
  vehicleType?: VehicleTypeEntity,
): VehicleTypeFormValues {
  return {
    code: vehicleType?.code ?? '',
    name: vehicleType?.name ?? '',
    description: vehicleType?.description ?? '',
    isFleet: vehicleType?.isFleet ?? false,
    isActive: vehicleType?.isActive ?? true,
  }
}

/**
 * Normaliza o código de um tipo (trim + uppercase) — espelho do
 * `normalizeCode` do backend (ADR 0006 §6).
 *
 * @param code Código em texto puro.
 * @returns Código normalizado.
 */
export function normalizeVehicleTypeCode(code: string): string {
  return code.trim().toUpperCase()
}

/**
 * Converte os valores do formulário no payload de criação.
 *
 * `isActive` não é enviado — o backend cria tipos ativos por padrão. O código
 * é normalizado (uppercase/trim).
 *
 * @param values Valores validados do formulário.
 * @returns Payload para criar tipo.
 */
export function toCreateVehicleTypePayload(
  values: VehicleTypeFormValues,
): CreateVehicleTypePayload {
  return {
    code: normalizeVehicleTypeCode(values.code),
    name: values.name.trim(),
    description: values.description?.trim() || null,
    isFleet: values.isFleet,
  }
}

/**
 * Converte os valores do formulário no payload de atualização (diff).
 *
 * Só campos alterados são enviados (PATCH parcial). `isActive` acompanha o
 * Switch (ativa/desativa) e `isFleet` a classificação.
 *
 * @param values Valores validados do formulário.
 * @param original Valores originais (antes da edição).
 * @returns Payload com apenas os campos alterados.
 */
export function toUpdateVehicleTypePayload(
  values: VehicleTypeFormValues,
  original: VehicleTypeFormValues,
): UpdateVehicleTypePayload {
  const payload: UpdateVehicleTypePayload = {}

  const code = normalizeVehicleTypeCode(values.code)
  if (code !== normalizeVehicleTypeCode(original.code)) {
    payload.code = code
  }

  const name = values.name.trim()
  if (name !== original.name.trim()) {
    payload.name = name
  }

  const description = values.description?.trim() || null
  const originalDescription = original.description?.trim() || null
  if (description !== originalDescription) {
    payload.description = description
  }

  if (values.isFleet !== original.isFleet) {
    payload.isFleet = values.isFleet
  }

  if (values.isActive !== original.isActive) {
    payload.isActive = values.isActive
  }

  return payload
}

/**
 * Monta a query string da listagem paginada de tipos.
 *
 * @param params Busca, filtros e paginação.
 * @returns Query string formatada para a URL.
 */
export function buildVehicleTypeListQuery(params: VehicleTypeListParams) {
  const searchParams = new URLSearchParams()

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.isFleet !== undefined) {
    searchParams.set('isFleet', String(params.isFleet))
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit))
  }

  if (params.offset !== undefined) {
    searchParams.set('offset', String(params.offset))
  }

  return searchParams.toString()
}
