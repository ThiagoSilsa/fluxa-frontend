// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { accessRequestService } from '../services/access-request.service'

// Types
import type { AccessRequestListParams } from '../types/access-requests.types'

/**
 * Busca a lista de solicitações de acesso (paginada/filtrada no servidor).
 *
 * A query key inclui status, placa e paginação — mudar qualquer um deles
 * re-busca no servidor. É invalidada após qualquer mutation de solicitação.
 *
 * @param params Filtros e paginação.
 * @returns Resultado com o envelope paginado.
 */
export function useAccessRequestsQuery(params: AccessRequestListParams) {
  return useQuery({
    queryKey: [
      'access-requests',
      {
        status: params.status,
        plate: params.plate,
        limit: params.limit,
        offset: params.offset,
      },
    ],
    queryFn: () => accessRequestService.list(params),
  })
}
