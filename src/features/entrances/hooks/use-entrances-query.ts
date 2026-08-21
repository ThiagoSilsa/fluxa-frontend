// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { entrancesService } from '../services/entrance.service'

// Types
import type { EntranceListParams } from '../types/entrances.types'

/**
 * Hook que busca a lista de portarias (paginada no servidor).
 *
 * A query key inclui busca, filtro de status e paginação — mudar qualquer um
 * deles re-busca no servidor. É invalidada após qualquer mutation de
 * portaria.
 *
 * @param params Busca, filtro de status e paginação.
 * @returns Resultado da query com o envelope paginado.
 */
export function useEntrancesQuery(params: EntranceListParams) {
  return useQuery({
    queryKey: [
      'entrances',
      {
        search: params.search,
        isActive: params.isActive,
        limit: params.limit,
        offset: params.offset,
      },
    ],
    queryFn: () => entrancesService.list(params),
  })
}
