// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { accessRequestService } from '../services/access-request.service'

// Types
import type { RoleOption } from '../types/access-requests.types'

/**
 * Busca os cargos ativos para o aceite de um Colaborador (`userType =
 * EMPLOYEE` — ADR 0013) — `GET /roles/options` (baixo privilégio para quem
 * gerencia solicitações — ADR 0011).
 *
 * @param enabled Só consulta quando o aceite realmente exige o cargo.
 * @returns Cargos ativos.
 */
export function useRoleOptionsQuery(enabled = true) {
  return useQuery({
    queryKey: ['access-request-roles'],
    queryFn: () => accessRequestService.listRoles(),
    enabled,
    retry: false,
  })
}

/** Tipo do resultado (para tipar props). */
export type RoleOptionsResult = RoleOption[] | undefined
