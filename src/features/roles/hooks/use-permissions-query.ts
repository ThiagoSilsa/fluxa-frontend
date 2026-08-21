// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { permissionsService } from '../services/role.service'

/**
 * Hook que busca o catálogo de permissões disponíveis.
 *
 * O catálogo é estável: cacheado por 5 minutos para evitar re-buscas
 * desnecessárias ao abrir dialogs de permissão.
 *
 * @returns Resultado da query com o array de permissões.
 */
export function usePermissionsQuery() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsService.list(),
    staleTime: 5 * 60 * 1000,
  })
}
