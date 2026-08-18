// Schemas
import type { DepartmentFormValues } from '../schemas/department.schema'

// Types
import type {
  CreateDepartmentPayload,
  DepartmentEntity,
  DepartmentListParams,
  UpdateDepartmentPayload,
} from '../types/departments.types'

/** Normaliza os valores padrão do formulário. */
export function normalizeDepartmentFormDefaults(
  department?: DepartmentEntity,
): DepartmentFormValues {
  return {
    name: department?.name ?? '',
    parkingSpace: department?.parkingSpace ?? 0,
    description: department?.description ?? '',
    isActive: department?.isActive ?? true,
  }
}

/** Converte os valores do formulário no payload de criação. */
export function toCreateDepartmentPayload(values: DepartmentFormValues): CreateDepartmentPayload {
  return {
    name: values.name.trim(),
    parkingSpace: values.parkingSpace,
    description: values.description?.trim() || null,
  }
}

/** Converte os valores do formulário no payload de atualização (diff). */
export function toUpdateDepartmentPayload(
  values: DepartmentFormValues,
  original: DepartmentFormValues,
): UpdateDepartmentPayload {
  const payload: UpdateDepartmentPayload = {}

  const name = values.name.trim()
  if (name !== original.name.trim()) {
    payload.name = name
  }

  if (values.parkingSpace !== original.parkingSpace) {
    payload.parkingSpace = values.parkingSpace
  }

  const description = values.description?.trim() || null
  const originalDescription = original.description?.trim() || null
  if (description !== originalDescription) {
    payload.description = description
  }

  if (values.isActive !== original.isActive) {
    payload.isActive = values.isActive
  }

  return payload
}

/** Monta a query string da listagem paginada. */
export function buildDepartmentListQuery(params: DepartmentListParams) {
  const searchParams = new URLSearchParams()

  if (params.search) {
    searchParams.set('search', params.search)
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
