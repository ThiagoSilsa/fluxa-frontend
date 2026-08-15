// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { rolesService } from '../services/role.service'

// Types
import type { RoleListParams } from '../types/roles.types'

/**
 * Hook que busca a lista de cargos (paginada no servidor).
 *
 * A query key inclui busca e paginação — mudar qualquer um dos três
 * re-busca no servidor. É invalidada após qualquer mutation de cargo.
 *
 * @param params - Busca e paginação (`search`, `limit`, `offset`).
 * @returns Resultado da query com o envelope paginado.
 */
export function useRolesQuery(params: RoleListParams) {
  return useQuery({
    queryKey: ['roles', { search: params.search, limit: params.limit, offset: params.offset }],
    queryFn: () => rolesService.list(params),
  })
}
