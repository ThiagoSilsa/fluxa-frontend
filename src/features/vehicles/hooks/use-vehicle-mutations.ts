// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Services
import { vehiclesService } from '../services/vehicle.service'

// Types
import type {
  AddDriverPayload,
  CreateVehiclePayload,
  UpdateDriverPayload,
  UpdateVehiclePayload,
} from '../types/vehicles.types'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'

/** Prefixos de query afetados por mutations de veículo (lista + detalhe). */
const VEHICLE_QUERY_KEYS = ['vehicles', 'vehicle-detail', 'driver-candidates']

/**
 * Hook que expõe as mutations de veículo: CRUD + vínculos de departamento
 * (set/remove) e motoristas (add/update/remove).
 *
 * Após sucesso, invalida a lista e o detalhe do veículo (refletindo os
 * vínculos) e exibe toast de sucesso; em falha, toast de erro padrão
 * (400/403/409 traduzidos).
 *
 * @returns Objeto com todas as mutations.
 */
export function useVehicleMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('vehicles')
  const { t: tc } = useTranslation('common')

  const invalidateVehicles = () => {
    VEHICLE_QUERY_KEYS.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] })
    })
  }

  /** Mutation para criar um novo veículo. */
  const createVehicle = useMutation({
    mutationFn: (payload: CreateVehiclePayload) => vehiclesService.create(payload),
    onSuccess: () => {
      invalidateVehicles()
      toast.success(t('notifications.create-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para atualizar um veículo existente. */
  const updateVehicle = useMutation({
    mutationFn: ({ vehicleId, payload }: { vehicleId: string; payload: UpdateVehiclePayload }) =>
      vehiclesService.update(vehicleId, payload),
    onSuccess: () => {
      invalidateVehicles()
      toast.success(t('notifications.update-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para excluir fisicamente um veículo (DELETE = 204). */
  const deleteVehicle = useMutation({
    mutationFn: (vehicleId: string) => vehiclesService.remove(vehicleId),
    onSuccess: () => {
      invalidateVehicles()
      toast.success(t('notifications.delete-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para definir o departamento padrão do veículo. */
  const setVehicleDepartment = useMutation({
    mutationFn: ({ vehicleId, departmentId }: { vehicleId: string; departmentId: string }) =>
      vehiclesService.setDepartment(vehicleId, departmentId),
    onSuccess: () => {
      invalidateVehicles()
      toast.success(t('notifications.department-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para remover o departamento padrão do veículo. */
  const removeVehicleDepartment = useMutation({
    mutationFn: (vehicleId: string) => vehiclesService.removeDepartment(vehicleId),
    onSuccess: () => {
      invalidateVehicles()
      toast.success(t('notifications.department-remove-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para vincular um motorista ao veículo. */
  const addDriver = useMutation({
    mutationFn: ({ vehicleId, payload }: { vehicleId: string; payload: AddDriverPayload }) =>
      vehiclesService.addDriver(vehicleId, payload),
    onSuccess: () => {
      invalidateVehicles()
      toast.success(t('notifications.driver-add-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para atualizar um motorista (isPrimary/canDrive). */
  const updateDriver = useMutation({
    mutationFn: ({
      vehicleId,
      userId,
      payload,
    }: {
      vehicleId: string
      userId: string
      payload: UpdateDriverPayload
    }) => vehiclesService.updateDriver(vehicleId, userId, payload),
    onSuccess: () => {
      invalidateVehicles()
      toast.success(t('notifications.driver-update-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para remover o vínculo de um motorista. */
  const removeDriver = useMutation({
    mutationFn: ({ vehicleId, userId }: { vehicleId: string; userId: string }) =>
      vehiclesService.removeDriver(vehicleId, userId),
    onSuccess: () => {
      invalidateVehicles()
      toast.success(t('notifications.driver-remove-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return {
    createVehicle,
    updateVehicle,
    deleteVehicle,
    setVehicleDepartment,
    removeVehicleDepartment,
    addDriver,
    updateDriver,
    removeDriver,
  }
}
