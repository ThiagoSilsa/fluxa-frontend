// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { departmentsService } from '../services/department.service'

// Types
import type { DepartmentListParams } from '../types/departments.types'

/**
 * Hook que busca a lista de departamentos (paginada no servidor).
 *
 * A query key inclui busca, filtro de status e paginação — mudar qualquer um
 * deles re-busca no servidor. É invalidada após qualquer mutation de
 * departamento.
 *
 * @param params Busca, filtro de status e paginação.
 * @returns Resultado da query com o envelope paginado.
 */
export function useDepartmentsQuery(params: DepartmentListParams) {
  return useQuery({
    queryKey: [
      'departments',
      {
        search: params.search,
        isActive: params.isActive,
        limit: params.limit,
        offset: params.offset,
      },
    ],
    queryFn: () => departmentsService.list(params),
  })
}
