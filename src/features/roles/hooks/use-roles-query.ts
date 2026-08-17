// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { rolesService } from '../services/role.service'

// Types
import type { RoleListParams } from '../types/roles.types'

/**
 * Hook que busca a lista de cargos (paginada no servidor).
 *
 * A query key inclui busca, filtro de status e paginação — mudar qualquer um
 * deles re-busca no servidor. É invalidada após qualquer mutation de cargo.
 *
 * @param params - Busca, filtro de status e paginação.
 * @returns Resultado da query com o envelope paginado.
 */
export function useRolesQuery(params: RoleListParams) {
  return useQuery({
    queryKey: [
      'roles',
      {
        search: params.search,
        isActive: params.isActive,
        limit: params.limit,
        offset: params.offset,
      },
    ],
    queryFn: () => rolesService.list(params),
  })
}
