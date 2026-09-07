// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { accessRequestService } from '../services/access-request.service'

// Types
import type { UserOption } from '../types/access-requests.types'

/**
 * Busca usuários para o seletor do cenário NEW_VEHICLE/LINK.
 *
 * O buscador é responsável por fazer o debounce do termo antes de chamar o
 * hook (padrão do projeto — `useDebouncedValue`).
 *
 * @param search Termo de busca (ou `null` para desabilitar).
 * @returns Opções de usuário.
 */
export function useUserOptionsQuery(search: string | null) {
  return useQuery({
    queryKey: ['access-request-users', search],
    queryFn: () => accessRequestService.listUsers(search as string),
    enabled: !!search && search.trim().length > 0,
    retry: false,
  })
}

/** Tipo do resultado (para tipar props). */
export type UserOptionsResult = UserOption[] | undefined
