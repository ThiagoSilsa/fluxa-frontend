// React
import { useCallback, useState } from 'react'

// Mappers
import {
  normalizeVehicleTypeFormDefaults,
  toCreateVehicleTypePayload,
  toUpdateVehicleTypePayload,
} from '../mappers/vehicle-type.mapper'

// Types
import type {
  UseVehicleTypeHandlersParams,
  UseVehicleTypeHandlersReturn,
  VehicleTypeDeleteTarget,
  VehicleTypeDialogState,
  VehicleTypeEntity,
  VehicleTypeFleetFilterValue,
  VehicleTypeStatusFilterValue,
} from '../types/vehicle-types.types'

// Schemas
import type { VehicleTypeFormValues } from '../schemas/vehicle-type.schema'

/**
 * Hook que centraliza a lógica de handlers da página de tipos de veículo.
 *
 * Gerencia o estado do dialog (criação/edição), o target de exclusão e os
 * filtros de status e de frota (server-side, sincronizados na URL), além dos
 * submits.
 *
 * @param params - Dependências: updateSearch, search e mutations.
 * @returns Estados e handlers para a página.
 */
export function useVehicleTypeHandlers({
  updateSearch,
  search,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
}: UseVehicleTypeHandlersParams): UseVehicleTypeHandlersReturn {
  // --- Estados ---
  const [formState, setFormState] = useState<VehicleTypeDialogState>(null)
  const [deleteTarget, setDeleteTarget] = useState<VehicleTypeDeleteTarget | null>(null)

  // --- Filtros (server-side, sincronizados na URL) ---

  /** Valor atual do filtro de status. */
  const statusValue: VehicleTypeStatusFilterValue =
    search.isActive === undefined ? 'all' : search.isActive ? 'active' : 'inactive'

  /** Valor atual do filtro de frota. */
  const isFleetValue: VehicleTypeFleetFilterValue =
    search.isFleet === undefined ? 'all' : search.isFleet ? 'fleet' : 'non-fleet'

  /**
   * Atualiza o filtro de status na URL.
   *
   * @param value - 'all' | 'active' | 'inactive'.
   */
  const handleStatusChange = (value: VehicleTypeStatusFilterValue) => {
    if (value === 'all') {
      updateSearch({ isActive: undefined })
      return
    }

    updateSearch({ isActive: value === 'active' })
  }

  /**
   * Atualiza o filtro de frota na URL.
   *
   * @param value - 'all' | 'fleet' | 'non-fleet'.
   */
  const handleIsFleetChange = (value: VehicleTypeFleetFilterValue) => {
    if (value === 'all') {
      updateSearch({ isFleet: undefined })
      return
    }

    updateSearch({ isFleet: value === 'fleet' })
  }

  // --- Dialogs ---

  /** Abre o dialog de criação. */
  const handleOpenCreate = () => {
    setFormState({ mode: 'create' })
  }

  /**
   * Abre o dialog de edição.
   *
   * @param vehicleType Entidade do tipo a editar.
   */
  const handleOpenEdit = (vehicleType: VehicleTypeEntity) => {
    setFormState({ mode: 'edit', vehicleType })
  }

  /** Fecha o dialog de formulário. */
  const handleCloseForm = () => {
    setFormState(null)
  }

  /**
   * Submete o formulário de criação/edição.
   *
   * @param values Valores validados do formulário.
   */
  const handleSubmitForm = async (values: VehicleTypeFormValues) => {
    try {
      if (formState?.mode === 'create') {
        await createVehicleType.mutateAsync(toCreateVehicleTypePayload(values))
      } else if (formState?.mode === 'edit' && formState.vehicleType) {
        const original = normalizeVehicleTypeFormDefaults(formState.vehicleType)
        const payload = toUpdateVehicleTypePayload(values, original)

        if (Object.keys(payload).length > 0) {
          await updateVehicleType.mutateAsync({
            vehicleTypeId: formState.vehicleType.id,
            payload,
          })
        }
      }

      setFormState(null)
    } catch {
      // O erro já foi tratado no onError da mutation (toast).
    }
  }

  /**
   * Confirma a exclusão física de um tipo de veículo (409 se em uso).
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return

    try {
      await deleteVehicleType.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // O erro já foi tratado no onError da mutation (toast).
    }
  }, [deleteTarget, deleteVehicleType])

  return {
    formState,
    setFormState,
    deleteTarget,
    setDeleteTarget,
    statusValue,
    handleStatusChange,
    isFleetValue,
    handleIsFleetChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleSubmitForm,
    handleConfirmDelete,
  }
}
