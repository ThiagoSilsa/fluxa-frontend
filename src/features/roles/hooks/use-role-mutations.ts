// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Services
import { rolesService } from '../services/role.service'

// Types
import type {
  AssignPermissionPayload,
  CreateRolePayload,
  UpdateRolePayload,
} from '../types/roles.types'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'

/**
 * Hook que expõe as mutations de cargo: criar, atualizar, desativar e o
 * toggle individual de permissões (vincular/remover).
 *
 * Cada mutation invalida a query afetada após sucesso e exibe toast de erro
 * padrão em caso de falha.
 *
 * @returns Objeto com as mutations createRole, updateRole, deactivateRole,
 * assignPermission e removePermission.
 */
export function useRoleMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('roles')
  const { t: tc } = useTranslation('common')

  /** Mutation para criar um novo cargo. */
  const createRole = useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success(t('notifications.create-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para atualizar um cargo existente. */
  const updateRole = useMutation({
    mutationFn: ({ roleId, payload }: { roleId: string; payload: UpdateRolePayload }) =>
      rolesService.update(roleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success(t('notifications.update-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para desativar um cargo (DELETE = soft). */
  const deactivateRole = useMutation({
    mutationFn: (roleId: string) => rolesService.deactivate(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success(t('notifications.deactivate-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para vincular uma permissão a um cargo (toggle individual). */
  const assignPermission = useMutation({
    mutationFn: ({ roleId, permissionId }: AssignPermissionPayload & { roleId: string }) =>
      rolesService.assignPermission(roleId, { permissionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] })
      toast.success(t('notifications.permission-assigned'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para remover uma permissão de um cargo (toggle individual). */
  const removePermission = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      rolesService.removePermission(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] })
      toast.success(t('notifications.permission-removed'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return {
    createRole,
    updateRole,
    deactivateRole,
    assignPermission,
    removePermission,
  }
}
