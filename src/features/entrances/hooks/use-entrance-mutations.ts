// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Services
import { entrancesService } from '../services/entrance.service'

// Types
import type { CreateEntrancePayload, UpdateEntrancePayload } from '../types/entrances.types'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'

/**
 * Hook que expõe as mutations de portaria: criar, atualizar e excluir
 * (físico — ADR 0006 §5, bloqueado com 409 quando há dispositivos vinculados
 * via `device`).
 *
 * Cada mutation invalida a query afetada após sucesso e exibe toast de erro
 * padrão em caso de falha (400/403/409 traduzidos).
 *
 * @returns Objeto com as mutations createEntrance, updateEntrance e
 * deleteEntrance.
 */
export function useEntranceMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('entrances')
  const { t: tc } = useTranslation('common')

  /** Mutation para criar uma nova portaria. */
  const createEntrance = useMutation({
    mutationFn: (payload: CreateEntrancePayload) => entrancesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrances'] })
      toast.success(t('notifications.create-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para atualizar uma portaria existente. */
  const updateEntrance = useMutation({
    mutationFn: ({ entranceId, payload }: { entranceId: string; payload: UpdateEntrancePayload }) =>
      entrancesService.update(entranceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrances'] })
      toast.success(t('notifications.update-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para excluir fisicamente uma portaria (DELETE = 204). */
  const deleteEntrance = useMutation({
    mutationFn: (entranceId: string) => entrancesService.remove(entranceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrances'] })
      toast.success(t('notifications.delete-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return {
    createEntrance,
    updateEntrance,
    deleteEntrance,
  }
}
