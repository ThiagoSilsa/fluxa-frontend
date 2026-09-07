// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { accessRequestService } from '../services/access-request.service'

/** Limite da lista "minhas solicitações" (sem paginação na tela do porteiro). */
const MY_REQUESTS_LIMIT = 100

/**
 * Busca as solicitações de bloqueio do próprio usuário (porteiro — listagem
 * escalonada, ADR 0012: sem gestão, retorna apenas as próprias).
 *
 * Desabilitada quando o ator não pode solicitar bloqueio ou é gestor.
 *
 * @param enabled Se a consulta deve ser executada.
 * @returns Envelope paginado com as próprias solicitações de bloqueio.
 */
export function useMyBlockRequestsQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['my-block-requests', { limit: MY_REQUESTS_LIMIT, offset: 0 }],
    queryFn: () => accessRequestService.listBlockRequests(MY_REQUESTS_LIMIT, 0),
    enabled,
    retry: false,
  })
}
