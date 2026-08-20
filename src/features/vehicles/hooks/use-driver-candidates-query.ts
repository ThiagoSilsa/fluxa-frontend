// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { vehiclesService } from '../services/vehicle.service'

/**
 * Hook que busca candidatos a motorista (pessoas com vínculo ativo na
 * empresa), com busca por nome.
 *
 * Habilitado apenas quando o seletor de motoristas está aberto (o seletor não
 * precisa de dados ociosos).
 *
 * @param search Termo de busca por nome.
 * @param enabled Se a query deve executar.
 * @returns Resultado da query de candidatos.
 */
export function useDriverCandidatesQuery(search: string, enabled: boolean) {
  return useQuery({
    queryKey: ['driver-candidates', { search }],
    queryFn: () =>
      vehiclesService.listDriverCandidates({
        search: search.trim() || undefined,
        limit: 20,
        offset: 0,
      }),
    enabled,
  })
}
