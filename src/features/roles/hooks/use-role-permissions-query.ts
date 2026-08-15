// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { rolesService } from '../services/role.service'

/**
 * Hook que busca as permissões de um cargo específico (vinculadas + catálogo).
 *
 * Habilitada apenas com `roleId` — usada no dialog de gerenciamento de
 * permissões. Invalidada após vincular/remover permissão.
 *
 * @param roleId - ID do cargo (null desativa a query).
 * @returns Resultado da query com `{ roleId, permissions, available }`.
 */
export function useRolePermissionsQuery(roleId: string | null) {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: () => rolesService.listRolePermissions(roleId as string),
    enabled: !!roleId,
  })
}
