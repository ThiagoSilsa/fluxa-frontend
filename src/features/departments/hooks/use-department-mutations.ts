// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Services
import { departmentsService } from '../services/department.service'

// Types
import type { CreateDepartmentPayload, UpdateDepartmentPayload } from '../types/departments.types'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'

/**
 * Hook que expõe as mutations de departamento: criar, atualizar e excluir
 * (físico — ADR 0006 §7, bloqueado com 409 quando há veículos vinculados via
 * `vehicle_department`).
 *
 * Cada mutation invalida a query afetada após sucesso e exibe toast de erro
 * padrão em caso de falha (400/403/409 traduzidos).
 *
 * @returns Objeto com as mutations createDepartment, updateDepartment e
 * deleteDepartment.
 */
export function useDepartmentMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('departments')
  const { t: tc } = useTranslation('common')

  /** Mutation para criar um novo departamento. */
  const createDepartment = useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => departmentsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success(t('notifications.create-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para atualizar um departamento existente. */
  const updateDepartment = useMutation({
    mutationFn: ({
      departmentId,
      payload,
    }: {
      departmentId: string
      payload: UpdateDepartmentPayload
    }) => departmentsService.update(departmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success(t('notifications.update-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para excluir fisicamente um departamento (DELETE = 204). */
  const deleteDepartment = useMutation({
    mutationFn: (departmentId: string) => departmentsService.remove(departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success(t('notifications.delete-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return {
    createDepartment,
    updateDepartment,
    deleteDepartment,
  }
}
