// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Services
import { blockService } from '../services/block.service'

// Types
import type { CreateBlockPayload, RevokeBlockPayload } from '../types/blocks.types'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'

/** Queries afetadas por mutations de bloqueio (bloqueios + solicitações). */
const BLOCK_QUERY_KEYS = ['blocks', 'block-requests']

/**
 * Mutations de bloqueios: criar/revogar `vehicle_block` e
 * criar/aprovar/rejeitar/cancelar `block_request`.
 *
 * Após sucesso, invalida a lista de bloqueios e de solicitações e exibe
 * toast; em falha, toast de erro traduzido.
 *
 * @returns Objeto com todas as mutations.
 */
export function useBlockMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('blocks')
  const { t: tc } = useTranslation('common')

  const invalidateBlocks = () => {
    BLOCK_QUERY_KEYS.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] })
    })
  }

  /** Mutation para criar um bloqueio (MANAGE_BLOCKS). */
  const createBlock = useMutation({
    mutationFn: (payload: CreateBlockPayload) => blockService.createBlock(payload),
    onSuccess: () => {
      invalidateBlocks()
      toast.success(t('notifications.create-block-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para revogar um bloqueio (motivo obrigatório). */
  const revokeBlock = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RevokeBlockPayload }) =>
      blockService.revokeBlock(id, payload),
    onSuccess: () => {
      invalidateBlocks()
      toast.success(t('notifications.revoke-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para criar uma solicitação de bloqueio (porteiro). */
  const createBlockRequest = useMutation({
    mutationFn: (payload: CreateBlockPayload) => blockService.createBlockRequest(payload),
    onSuccess: () => {
      invalidateBlocks()
      toast.success(t('notifications.create-request-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para aprovar uma solicitação (cria o bloqueio). */
  const approveBlockRequest = useMutation({
    mutationFn: (id: string) => blockService.approveBlockRequest(id),
    onSuccess: () => {
      invalidateBlocks()
      toast.success(t('notifications.approve-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para rejeitar uma solicitação. */
  const rejectBlockRequest = useMutation({
    mutationFn: (id: string) => blockService.rejectBlockRequest(id),
    onSuccess: () => {
      invalidateBlocks()
      toast.success(t('notifications.reject-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para cancelar uma solicitação (porteiro — PENDING). */
  const cancelBlockRequest = useMutation({
    mutationFn: (id: string) => blockService.cancelBlockRequest(id),
    onSuccess: () => {
      invalidateBlocks()
      toast.success(t('notifications.cancel-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return {
    createBlock,
    revokeBlock,
    createBlockRequest,
    approveBlockRequest,
    rejectBlockRequest,
    cancelBlockRequest,
  }
}
