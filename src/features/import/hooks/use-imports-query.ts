// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Types
import type { ImportJobListResponse, ImportJobsParams } from '../types/import.types'

/** Contrato mínimo de um service de importação (método de listagem). */
export type ImportListServiceLike = {
  list: (params?: ImportJobsParams) => Promise<ImportJobListResponse>
}

/**
 * Hook genérico que busca o histórico de importações de uma sub-página
 * (paginado). Compartilhado por todas as sub-páginas (AGENTS.md).
 *
 * @param service Service de importação da sub-página.
 * @param params Paginação (limit/offset).
 * @returns Resultado da query com o envelope paginado.
 */
export function useImportsQuery(service: ImportListServiceLike, params?: ImportJobsParams) {
  return useQuery({
    queryKey: ['imports', params],
    queryFn: () => service.list(params),
  })
}
