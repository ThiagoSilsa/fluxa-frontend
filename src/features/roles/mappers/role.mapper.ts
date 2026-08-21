// Schemas
import type { RoleFormValues } from '../schemas/role-form.schema'

// Types
import type {
  CreateRolePayload,
  RoleEntity,
  RoleListParams,
  UpdateRolePayload,
} from '../types/roles.types'

/**
 * Normaliza os valores padrão do formulário de cargo.
 * Com entidade (edição) preenche com os dados existentes; sem ela, vazio
 * (criação nasce ativa).
 *
 * @param role - Entidade de cargo opcional (modo edição).
 * @returns Valores padrão para o formulário.
 */
export function normalizeRoleFormDefaults(role?: RoleEntity): RoleFormValues {
  return {
    name: role?.name ?? '',
    description: role?.description ?? '',
    isActive: role?.isActive ?? true,
  }
}

/**
 * Converte os valores do formulário no payload de criação.
 *
 * @param values - Valores validados do formulário.
 * @returns Payload para criar cargo.
 */
export function toCreateRolePayload(values: RoleFormValues): CreateRolePayload {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || null,
  }
}

/**
 * Converte os valores do formulário no payload de atualização.
 *
 * `isActive` acompanha o valor atual do Switch (edição).
 *
 * @param values - Valores validados do formulário.
 * @returns Payload para atualizar cargo.
 */
export function toUpdateRolePayload(values: RoleFormValues): UpdateRolePayload {
  return {
    name: values.name.trim() || undefined,
    description: values.description?.trim() || null,
    isActive: values.isActive,
  }
}

/**
 * Monta a query string da listagem paginada de cargos.
 *
 * @param params - Busca e paginação.
 * @returns Query string formatada para a URL.
 */
export function buildRoleListQuery(params: RoleListParams) {
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
