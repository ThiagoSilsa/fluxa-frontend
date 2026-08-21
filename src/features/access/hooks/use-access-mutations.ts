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
  RegisterEntryPayload,
  RegisterExitPayload,
} from '../types/access.types'

// Shared libs
import { getAPIErrorTranslationKey, isApiError } from '#/shared/lib/api-error'

/** Queries afetadas por mutations de acesso (conferência na saída). */
const ACCESS_QUERY_KEYS = ['access-open']

/**
 * Mutations da portaria: registrar entrada e registrar saída.
 *
 * Em caso de **409 (vaga cheia)**, o toast é suprimido — a página oferece a
 * confirmação `overCapacity` ao porteiro. Os demais erros (400/403/404)
 * viram toast traduzido.
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
        toast.success(t('notifications.entry-success'))
      }
      invalidateAccess()
    },
    onError: (error) => {
      // 409 (vaga cheia) é tratado pela página (confirmação overCapacity).
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

  return { registerEntry, registerExit }
}
