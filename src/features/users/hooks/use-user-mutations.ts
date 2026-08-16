// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Services
import { usersService } from '../services/user.service'

// Types
import type { CreateUserPayload, UpdateUserPayload } from '../types/users.types'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'

/**
 * Hook que expõe as mutations de usuário: criar (já vinculado), editar
 * (parcial, com replace de cargo no payload), desativar (soft) e trocar
 * senha.
 *
 * Cada mutation invalida a query afetada após sucesso e exibe toast de erro
 * padrão em caso de falha (400/403/409 traduzidos).
 *
 * @returns Objeto com as mutations createUser, updateUser, deactivateUser e
 * changePassword.
 */
export function useUserMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('users')
  const { t: tc } = useTranslation('common')

  /** Mutation para criar um usuário já vinculado à empresa. */
  const createUser = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(t('notifications.create-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para editar parcialmente um usuário. */
  const updateUser = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) =>
      usersService.update(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(t('notifications.update-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para desativar a participação do usuário (soft). */
  const deactivateUser = useMutation({
    mutationFn: (userId: string) => usersService.deactivate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(t('notifications.deactivate-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para trocar a senha de um usuário (provisório — MANAGE_USERS). */
  const changePassword = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      usersService.changePassword(userId, newPassword),
    onSuccess: () => {
      toast.success(t('notifications.password-reset-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return {
    createUser,
    updateUser,
    deactivateUser,
    changePassword,
  }
}
