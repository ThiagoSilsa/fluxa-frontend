// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Services
import { accessRequestService } from '../services/access-request.service'

// Types
import type {
  AcceptAccessRequestPayload,
  CreateAccessRequestPayload,
} from '../types/access-requests.types'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'

/** Queries afetadas por mutations de solicitação (lista). */
const ACCESS_REQUEST_QUERY_KEYS = ['access-requests']

/**
 * Mutations de solicitações de acesso: criar, aceitar (resolução
 * retroativa), rejeitar, marcar em contato e cancelar.
 *
 * Após sucesso, invalida a lista e exibe toast de sucesso; em falha, toast de
 * erro padrão traduzido.
 *
 * @returns Objeto com todas as mutations.
 */
export function useAccessRequestMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('accessRequests')
  const { t: tc } = useTranslation('common')

  const invalidateRequests = () => {
    ACCESS_REQUEST_QUERY_KEYS.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] })
    })
  }

  /** Mutation para criar uma solicitação (porteiro). */
  const create = useMutation({
    mutationFn: (payload: CreateAccessRequestPayload) => accessRequestService.create(payload),
    onSuccess: () => {
      invalidateRequests()
      toast.success(t('notifications.create-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para aceitar (admin — resolução retroativa). */
  const accept = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AcceptAccessRequestPayload }) =>
      accessRequestService.accept(id, payload),
    onSuccess: () => {
      invalidateRequests()
      toast.success(t('notifications.accept-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para rejeitar. */
  const reject = useMutation({
    mutationFn: ({ id, observation }: { id: string; observation?: string }) =>
      accessRequestService.reject(id, { observation }),
    onSuccess: () => {
      invalidateRequests()
      toast.success(t('notifications.reject-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para marcar como em contato (estende o prazo). */
  const markInContact = useMutation({
    mutationFn: (id: string) => accessRequestService.markInContact(id),
    onSuccess: () => {
      invalidateRequests()
      toast.success(t('notifications.in-contact-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para cancelar (porteiro — apenas PENDING). */
  const cancel = useMutation({
    mutationFn: (id: string) => accessRequestService.cancel(id),
    onSuccess: () => {
      invalidateRequests()
      toast.success(t('notifications.cancel-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return { create, accept, reject, markInContact, cancel }
}
