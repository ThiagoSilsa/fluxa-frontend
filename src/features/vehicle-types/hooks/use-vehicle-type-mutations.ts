// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Services
import { vehicleTypesService } from '../services/vehicle-type.service'

// Types
import type {
  CreateVehicleTypePayload,
  UpdateVehicleTypePayload,
} from '../types/vehicle-types.types'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'

/**
 * Hook que expõe as mutations de tipo de veículo: criar, atualizar e excluir
 * (físico — ADR 0006 §6, bloqueado com 409 quando há veículos usando o tipo).
 *
 * Cada mutation invalida a query afetada após sucesso e exibe toast de erro
 * padrão em caso de falha (400/403/409 traduzidos).
 *
 * @returns Objeto com as mutations createVehicleType, updateVehicleType e
 * deleteVehicleType.
 */
export function useVehicleTypeMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('vehicleTypes')
  const { t: tc } = useTranslation('common')

  /** Mutation para criar um novo tipo de veículo. */
  const createVehicleType = useMutation({
    mutationFn: (payload: CreateVehicleTypePayload) => vehicleTypesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] })
      toast.success(t('notifications.create-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para atualizar um tipo de veículo existente. */
  const updateVehicleType = useMutation({
    mutationFn: ({
      vehicleTypeId,
      payload,
    }: {
      vehicleTypeId: string
      payload: UpdateVehicleTypePayload
    }) => vehicleTypesService.update(vehicleTypeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] })
      toast.success(t('notifications.update-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para excluir fisicamente um tipo de veículo (DELETE = 204). */
  const deleteVehicleType = useMutation({
    mutationFn: (vehicleTypeId: string) => vehicleTypesService.remove(vehicleTypeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] })
      toast.success(t('notifications.delete-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return {
    createVehicleType,
    updateVehicleType,
    deleteVehicleType,
  }
}
