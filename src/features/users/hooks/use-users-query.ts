// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { usersService } from '../services/user.service'

// Types
import type { UserListParams } from '../types/users.types'

/**
 * Hook que busca a lista de usuários (paginada no servidor).
 *
 * A query key inclui busca, filtros e paginação — mudar qualquer um deles
 * re-busca no servidor. É invalidada após qualquer mutation de usuário.
 *
 * @param params Busca, filtros e paginação.
 * @returns Resultado da query com o envelope paginado.
 */
export function useUsersQuery(params: UserListParams) {
  return useQuery({
    queryKey: [
      'users',
      {
        search: params.search,
        type: params.type,
        isActive: params.isActive,
        limit: params.limit,
        offset: params.offset,
      },
    ],
    queryFn: () => usersService.list(params),
  })
}
