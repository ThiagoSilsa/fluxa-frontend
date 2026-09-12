// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Services
import { accessService } from '../services/access.service'

// Types
import type {
  AccessEntryResponse,
  RegisterDenialPayload,
  RegisterDenialResponse,
  RegisterEntryPayload,
  RegisterExitPayload,
} from '../types/access.types'

// Shared libs
import { getAPIErrorTranslationKey, isApiError } from '#/shared/lib/api-error'

/**
 * Queries afetadas por mutations de acesso: o feed da portaria, a conferência
 * de saída e a ficha da placa (registrar muda veredito, ocupação e reentrada).
 */
const ACCESS_QUERY_KEYS = ['access-records', 'access-open', 'access-context']

/**
 * Mutations da portaria: registrar entrada, saída e impedimento.
 *
 * Em caso de **409 (vaga cheia)**, o toast é suprimido — a ficha oferece a
 * confirmação `overCapacity` ao porteiro. Os demais erros (400/403/404) viram
 * toast traduzido.
 *
 * @returns Objeto com as mutations.
 */
export function useAccessMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('access')
  const { t: tc } = useTranslation('common')

  const invalidateAccess = () => {
    ACCESS_QUERY_KEYS.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] })
    })
  }

  /** Mutation para registrar a entrada. */
  const registerEntry = useMutation({
    mutationFn: (payload: RegisterEntryPayload) => accessService.registerEntry(payload),
    onSuccess: (data: AccessEntryResponse) => {
      if (data.granted) {
        // A mensagem do servidor distingue a exceção ("...com solicitação").
        toast.success(data.message || t('notifications.entry-success'))
      }
      invalidateAccess()
    },
    onError: (error) => {
      // 409 (vaga cheia) é tratado pela ficha (confirmação overCapacity).
      if (isApiError(error) && error.statusCode === 409) {
        return
      }
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para registrar a saída. */
  const registerExit = useMutation({
    mutationFn: (payload: RegisterExitPayload) => accessService.registerExit(payload),
    onSuccess: () => {
      toast.success(t('notifications.exit-success'))
      invalidateAccess()
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para registrar o impedimento (com pedido de bloqueio opcional). */
  const registerDenial = useMutation({
    mutationFn: (payload: RegisterDenialPayload) => accessService.registerDenial(payload),
    onSuccess: (data: RegisterDenialResponse) => {
      toast.success(t('notifications.denial-success'))
      // O impedimento é sucesso mesmo quando o bloqueio não pôde ser pedido: o
      // aviso vem à parte (`blockRequestError`), sem contaminar o registro.
      if (data.blockRequestError) {
        toast.warning(data.blockRequestError)
      } else if (data.blockRequest) {
        toast.success(t('notifications.block-request-success'))
      }
      invalidateAccess()
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return { registerEntry, registerExit, registerDenial }
}
