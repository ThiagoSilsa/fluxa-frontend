// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { blockService } from '../services/block.service'

// Types
import type { BlockRequestListParams } from '../types/blocks.types'

/**
 * Busca a lista de solicitações de bloqueio (status + paginação).
 *
 * @param params Filtros e paginação.
 * @returns Resultado com o envelope paginado.
 */
export function useBlockRequestsQuery(params: BlockRequestListParams) {
  return useQuery({
    queryKey: [
      'block-requests',
      {
        status: params.status,
        limit: params.limit,
        offset: params.offset,
      },
    ],
    queryFn: () => blockService.listBlockRequests(params),
  })
}
