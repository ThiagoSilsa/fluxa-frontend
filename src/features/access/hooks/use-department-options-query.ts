// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { accessService } from '../services/access.service'

// Mappers
import { toOccupancyDepartmentViews } from '../mappers/access.mapper'

/** Chave da query de opções de setor (compartilhada com a troca na ficha). */
export const DEPARTMENT_OPTIONS_QUERY_KEY = 'access-department-options'

/**
 * Setores ativos da empresa para o seletor da ficha (regra 27).
 *
 * Não existe endpoint de setores acessível ao porteiro (`GET /departments` exige
 * `MANAGE_DEPARTMENTS`), e o contexto só devolve o setor considerado e o padrão
 * do veículo. A ocupação (`GET /access/occupancy`, `VIEW_DASHBOARDS`) é a única
 * fonte que lista **todos** os setores ativos com nome — e é a mesma base que o
 * painel de ocupação usa.
 *
 * Sem a permissão, a query falha em silêncio (`retry: false`) e o seletor cai
 * no que o contexto oferece (setor padrão ou "vagas livres").
 *
 * @param enabled Habilita a consulta (só com o modal aberto).
 * @returns Setores ativos (vazio enquanto carrega).
 */
export function useDepartmentOptionsQuery(enabled: boolean) {
  return useQuery({
    queryKey: [DEPARTMENT_OPTIONS_QUERY_KEY],
    queryFn: accessService.getOccupancy,
    enabled,
    retry: false,
    staleTime: 60_000,
    select: (occupancy) => toOccupancyDepartmentViews(occupancy.byDepartment),
  })
}
