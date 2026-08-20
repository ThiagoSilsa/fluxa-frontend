// React
import { useCallback, useState } from 'react'

// Mappers
import {
  normalizeVehicleFormDefaults,
  toCreateVehiclePayload,
  toUpdateVehiclePayload,
} from '../mappers/vehicle.mapper'

// Types
import type {
  UseVehicleHandlersParams,
  UseVehicleHandlersReturn,
  VehicleDeleteTarget,
  VehicleDialogState,
  VehicleEntity,
  VehicleFreePassFilterValue,
  VehicleStatusFilterValue,
} from '../types/vehicles.types'

// Schemas
import type { VehicleFormValues } from '../schemas/vehicle.schema'

/**
 * Hook que centraliza a lógica de handlers da página de veículos.
 *
 * Gerencia o estado do dialog (criação/edição), o target de exclusão, o
 * target de detalhe (aberto no clique da linha) e os filtros (status, livre
 * acesso, tipo e departamento — server-side, sincronizados na URL).
 *
 * @param params - Dependências: updateSearch, search e mutations.
 * @returns Estados e handlers para a página.
 */
export function useVehicleHandlers({
  updateSearch,
  search,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  setVehicleDepartment,
  removeVehicleDepartment,
}: UseVehicleHandlersParams): UseVehicleHandlersReturn {
  // --- Estados ---
  const [formState, setFormState] = useState<VehicleDialogState>(null)
  const [deleteTarget, setDeleteTarget] = useState<VehicleDeleteTarget | null>(null)
  const [detailTarget, setDetailTarget] = useState<VehicleEntity | null>(null)

  // --- Filtros (server-side, sincronizados na URL) ---

  /** Valor atual do filtro de status. */
  const statusValue: VehicleStatusFilterValue =
    search.isActive === undefined ? 'all' : search.isActive ? 'active' : 'inactive'

  /** Valor atual do filtro de livre acesso. */
  const freePassValue: VehicleFreePassFilterValue =
    search.freePass === undefined ? 'all' : search.freePass ? 'free' : 'no-free'

  /**
   * Atualiza o filtro de status na URL.
   *
   * @param value - 'all' | 'active' | 'inactive'.
   */
  const handleStatusChange = (value: VehicleStatusFilterValue) => {
    if (value === 'all') {
      updateSearch({ isActive: undefined })
      return
    }
    updateSearch({ isActive: value === 'active' })
  }

  /**
   * Atualiza o filtro de livre acesso na URL.
   *
   * @param value - 'all' | 'free' | 'no-free'.
   */
  const handleFreePassChange = (value: VehicleFreePassFilterValue) => {
    if (value === 'all') {
      updateSearch({ freePass: undefined })
      return
    }
    updateSearch({ freePass: value === 'free' })
  }

  // --- Dialogs ---

  /** Abre o dialog de criação. */
  const handleOpenCreate = () => {
    setFormState({ mode: 'create' })
  }

  /**
   * Abre o dialog de edição.
   *
   * @param vehicle Entidade do veículo a editar.
   */
  const handleOpenEdit = (vehicle: VehicleEntity) => {
    setFormState({ mode: 'edit', vehicle, departmentId: undefined })
  }

  /**
   * Registra o departamento atual do veículo em edição (carregado pelo dialog).
   *
   * @param departmentId Id do departamento atual (ou `''` se não houver).
   */
  const handleCurrentDepartmentChange = (departmentId: string) => {
    setFormState((prev) => (prev?.mode === 'edit' ? { ...prev, departmentId } : prev))
  }

  /** Fecha o dialog de formulário. */
  const handleCloseForm = () => {
    setFormState(null)
  }

  /**
   * Abre o detalhe do veículo (clique na linha).
   *
   * @param vehicle Entidade do veículo (linha clicada).
   */
  const handleOpenDetail = (vehicle: VehicleEntity) => {
    setDetailTarget(vehicle)
  }

  /** Fecha o dialog de detalhe. */
  const handleCloseDetail = () => {
    setDetailTarget(null)
  }

  /**
   * Submete o formulário de criação/edição.
   *
   * No create, o departamento (se escolhido) é vinculado após criar o veículo
   * (PUT /vehicles/:id/department). No edit, além do diff dos campos, o
   * departamento é sincronizado com o vínculo atual (set/remove).
   *
   * @param values Valores validados do formulário.
   */
  const handleSubmitForm = async (values: VehicleFormValues) => {
    try {
      if (formState?.mode === 'create') {
        const created = await createVehicle.mutateAsync(toCreateVehiclePayload(values))

        if (values.departmentId) {
          await setVehicleDepartment.mutateAsync({
            vehicleId: created.id,
            departmentId: values.departmentId,
          })
        }
      } else if (formState?.mode === 'edit' && formState.vehicle) {
        const original = normalizeVehicleFormDefaults(formState.vehicle, formState.departmentId)
        const payload = toUpdateVehiclePayload(values, original)

        if (Object.keys(payload).length > 0) {
          await updateVehicle.mutateAsync({
            vehicleId: formState.vehicle.id,
            payload,
          })
        }

        // Sincroniza o departamento padrão (somente se mudou).
        const currentDepartmentId = formState.departmentId ?? ''
        if (values.departmentId !== currentDepartmentId) {
          if (values.departmentId) {
            await setVehicleDepartment.mutateAsync({
              vehicleId: formState.vehicle.id,
              departmentId: values.departmentId,
            })
          } else {
            await removeVehicleDepartment.mutateAsync(formState.vehicle.id)
          }
        }
      }

      setFormState(null)
    } catch {
      // O erro já foi tratado no onError da mutation (toast).
    }
  }

  /**
   * Confirma a exclusão física de um veículo (409 se houver vínculos).
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return

    try {
      await deleteVehicle.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // O erro já foi tratado no onError da mutation (toast).
    }
  }, [deleteTarget, deleteVehicle])

  return {
    formState,
    setFormState,
    deleteTarget,
    setDeleteTarget,
    detailTarget,
    setDetailTarget,
    statusValue,
    handleStatusChange,
    freePassValue,
    handleFreePassChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDetail,
    handleCloseDetail,
    handleCurrentDepartmentChange,
    handleSubmitForm,
    handleConfirmDelete,
  }
}
