// Mapper
import { buildRoleListQuery } from '../mappers/role.mapper'

// Types
import type {
  AssignPermissionPayload,
  CreateRolePayload,
  PermissionEntity,
  RoleEntity,
  RoleListParams,
  RoleListResponse,
  RolePermissionsResponse,
  UpdateRolePayload,
} from '../types/roles.types'

// Controller
import baseController from '#/shared/controller/base.controller'

/**
 * Service de cargos.
 *
 * Responsável por toda comunicação com a API de cargos (`/roles`).
 * Contrato: listagem paginada (`search`, `limit`, `offset`), criação,
 * atualização (PATCH), desativação (DELETE = soft) e vínculo individual de
 * permissões (POST/DELETE — sem substituição em lote).
 */
class RolesService {
  /**
   * Lista cargos paginados.
   *
   * @param params - Busca e paginação.
   * @returns Envelope paginado `{ limit, offset, data, count }`.
   */
  async list(params: RoleListParams): Promise<RoleListResponse> {
    const query = buildRoleListQuery(params)

    return baseController.makeRequest({
      endpoint: `/roles?${query}`,
      method: 'GET',
    })
  }

  /**
   * Cria um novo cargo.
   *
   * @param payload - Dados para criação.
   * @returns O cargo criado.
   */
  async create(payload: CreateRolePayload): Promise<RoleEntity> {
    return baseController.makeRequest({
      endpoint: '/roles',
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Atualiza um cargo existente.
   *
   * @param roleId - ID do cargo.
   * @param payload - Dados para atualização.
   * @returns O cargo atualizado.
   */
  async update(roleId: string, payload: UpdateRolePayload): Promise<RoleEntity> {
    return baseController.makeRequest({
      endpoint: `/roles/${roleId}`,
      method: 'PATCH',
      body: payload,
    })
  }

  /**
   * Desativa um cargo (DELETE = soft delete no backend).
   *
   * @param roleId - ID do cargo.
   * @returns O cargo desativado.
   */
  async deactivate(roleId: string): Promise<RoleEntity> {
    return baseController.makeRequest({
      endpoint: `/roles/${roleId}`,
      method: 'DELETE',
    })
  }

  /**
   * Busca as permissões de um cargo (vinculadas + catálogo disponível).
   *
   * @param roleId - ID do cargo.
   * @returns `{ roleId, permissions, available }`.
   */
  async listRolePermissions(roleId: string): Promise<RolePermissionsResponse> {
    return baseController.makeRequest({
      endpoint: `/roles/${roleId}/permissions`,
      method: 'GET',
    })
  }

  /**
   * Vincula uma permissão a um cargo (toggle individual).
   *
   * @param roleId - ID do cargo.
   * @param payload - ID da permissão a vincular.
   */
  async assignPermission(roleId: string, payload: AssignPermissionPayload): Promise<unknown> {
    return baseController.makeRequest({
      endpoint: `/roles/${roleId}/permissions`,
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Remove uma permissão de um cargo (toggle individual).
   *
   * @param roleId - ID do cargo.
   * @param permissionId - ID da permissão a remover.
   */
  async removePermission(roleId: string, permissionId: string): Promise<unknown> {
    return baseController.makeRequest({
      endpoint: `/roles/${roleId}/permissions/${permissionId}`,
      method: 'DELETE',
    })
  }
}

/**
 * Service de permissões (catálogo).
 *
 * Responsável por buscar o catálogo de permissões disponíveis (`/permissions`).
 */
class PermissionsService {
  /**
   * Lista todas as permissões disponíveis (catálogo).
   *
   * @returns Array de permissões.
   */
  async list(): Promise<PermissionEntity[]> {
    return baseController.makeRequest({
      endpoint: '/permissions',
      method: 'GET',
    })
  }
}

export const rolesService = new RolesService()
export const permissionsService = new PermissionsService()
