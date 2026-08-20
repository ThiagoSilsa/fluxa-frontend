// Schemas
import type { VehicleFormValues } from '../schemas/vehicle.schema'

// Types
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleEntity,
  VehicleListParams,
} from '../types/vehicles.types'

// Utils
import { normalizePlate } from '../utils/plate'

/** Normaliza os valores padrão do formulário. */
export function normalizeVehicleFormDefaults(
  vehicle?: VehicleEntity,
  currentDepartmentId?: string,
): VehicleFormValues {
  return {
    plate: vehicle?.plate ?? '',
    vehicleTypeId: vehicle?.vehicleTypeId ?? '',
    model: vehicle?.model ?? '',
    color: vehicle?.color ?? '',
    observation: vehicle?.observation ?? '',
    departmentId: currentDepartmentId ?? '',
    freePass: vehicle?.freePass ?? false,
    isActive: vehicle?.isActive ?? true,
  }
}

/** Converte os valores do formulário no payload de criação. */
export function toCreateVehiclePayload(values: VehicleFormValues): CreateVehiclePayload {
  return {
    plate: normalizePlate(values.plate),
    vehicleTypeId: values.vehicleTypeId,
    model: values.model?.trim() || null,
    color: values.color?.trim() || null,
    observation: values.observation?.trim() || null,
    freePass: values.freePass,
  }
}

/** Converte os valores do formulário no payload de atualização (diff). */
export function toUpdateVehiclePayload(
  values: VehicleFormValues,
  original: VehicleFormValues,
): UpdateVehiclePayload {
  const payload: UpdateVehiclePayload = {}

  const plate = normalizePlate(values.plate)
  if (plate !== normalizePlate(original.plate)) {
    payload.plate = plate
  }

  const model = values.model?.trim() || null
  if (model !== (original.model?.trim() || null)) {
    payload.model = model
  }

  const color = values.color?.trim() || null
  if (color !== (original.color?.trim() || null)) {
    payload.color = color
  }

  const observation = values.observation?.trim() || null
  if (observation !== (original.observation?.trim() || null)) {
    payload.observation = observation
  }

  if (values.vehicleTypeId !== original.vehicleTypeId) {
    payload.vehicleTypeId = values.vehicleTypeId
  }

  if (values.freePass !== original.freePass) {
    payload.freePass = values.freePass
  }

  if (values.isActive !== original.isActive) {
    payload.isActive = values.isActive
  }

  return payload
}

/** Monta a query string da listagem paginada/ordenada. */
export function buildVehicleListQuery(params: VehicleListParams) {
  const searchParams = new URLSearchParams()

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.vehicleTypeId) {
    searchParams.set('vehicleTypeId', params.vehicleTypeId)
  }

  if (params.departmentId) {
    searchParams.set('departmentId', params.departmentId)
  }

  if (params.freePass !== undefined) {
    searchParams.set('freePass', String(params.freePass))
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  if (params.sortBy) {
    searchParams.set('sortBy', params.sortBy)
  }

  if (params.sortOrder) {
    searchParams.set('sortOrder', params.sortOrder)
  }

  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit))
  }

  if (params.offset !== undefined) {
    searchParams.set('offset', String(params.offset))
  }

  return searchParams.toString()
}
