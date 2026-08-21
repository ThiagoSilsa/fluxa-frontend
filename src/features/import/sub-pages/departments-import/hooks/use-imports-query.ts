// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Service
import { departmentsImportService } from '../services/departments-import.service'

// Types
import type { ImportJobsParams } from '../../../types/import.types'

/**
 * Hook que busca o histórico de importações de departamentos (paginado).
 *
 * @param params Paginação (limit/offset).
 * @returns Resultado da query com o envelope paginado.
 */
export function useImportsQuery(params?: ImportJobsParams) {
  return useQuery({
    queryKey: ['imports', params],
    queryFn: () => departmentsImportService.list(params),
  })
}
