// React
import { useCallback, useMemo, useState } from 'react'

// Hooks
import { useRolePermissionsQuery } from './use-role-permissions-query'
import { useRoleMutations } from './use-role-mutations'

// Types
import type { PermissionEntity } from '../types/roles.types'

/**
 * Hook que centraliza a lógica do dialog de permissões de um cargo.
 *
 * Busca as permissões do cargo (vinculadas + catálogo), deriva o conjunto de
 * IDs vinculados e expõe o toggle individual (vincular/remover) com controle
 * de pendência por permissão — evita toggles concorrentes no mesmo checkbox.
 *
 * @param roleId - ID do cargo (null desativa a query).
 * @returns Dados e controle do dialog de permissões.
 */
export function useRolePermissions(roleId: string | null) {
  const { data, isPending } = useRolePermissionsQuery(roleId)
  const { assignPermission, removePermission } = useRoleMutations()

  const [pendingPermissionId, setPendingPermissionId] = useState<string | null>(null)

  /** Conjunto de IDs de permissões já vinculadas ao cargo. */
  const assignedIds = useMemo(
    () => new Set((data?.permissions ?? []).map((permission) => permission.id)),
    [data],
  )

  /**
   * Alterna o vínculo de uma permissão: remove se já vinculada, vincula caso
   * contrário. Chama a mutation individual correspondente (sem replace-all).
   *
   * @param permission - Permissão a alternar.
   */
  const handleToggle = useCallback(
    async (permission: PermissionEntity) => {
      if (!roleId) return

      const isAssigned = assignedIds.has(permission.id)
      setPendingPermissionId(permission.id)

      try {
        if (isAssigned) {
          await removePermission.mutateAsync({ roleId, permissionId: permission.id })
        } else {
          await assignPermission.mutateAsync({ roleId, permissionId: permission.id })
        }
      } catch {
        // O erro já foi tratado no onError da mutation (toast).
      } finally {
        setPendingPermissionId(null)
      }
    },
    [roleId, assignedIds, assignPermission, removePermission],
  )

  return {
    /** Permissões já vinculadas ao cargo. */
    permissions: data?.permissions ?? [],
    /** Catálogo de permissões disponíveis para vínculo. */
    available: data?.available ?? [],
    isLoading: isPending,
    assignedIds,
    /** ID da permissão com toggle em andamento. */
    pendingPermissionId,
    handleToggle,
  }
}
