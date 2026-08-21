// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { blockService } from '../services/block.service'

// Types
import type { BlockListParams } from '../types/blocks.types'

/**
 * Busca a lista de bloqueios (busca + status + paginação no servidor).
 *
 * A query key inclui busca, status e paginação — mudar qualquer um deles
 * re-busca no servidor. É invalidada após criar/revogar bloqueio.
 *
 * @param params Filtros e paginação.
 * @returns Resultado com o envelope paginado.
 */
export function useBlocksQuery(params: BlockListParams) {
  return useQuery({
    queryKey: [
      'blocks',
      {
        search: params.search,
        status: params.status,
        limit: params.limit,
        offset: params.offset,
      },
    ],
    queryFn: () => blockService.listBlocks(params),
  })
}
