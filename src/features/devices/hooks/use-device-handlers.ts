// React
import { useCallback, useState } from 'react'

// Mappers
import {
  normalizeDeviceFormDefaults,
  toCreateDevicePayload,
  toUpdateDevicePayload,
} from '../mappers/device.mapper'

// Types
import type {
  DeviceDeleteTarget,
  DeviceDialogState,
  DeviceEntity,
  DeviceRotateTarget,
  DeviceStatusFilterValue,
  DeviceTokenTarget,
  UseDeviceHandlersParams,
  UseDeviceHandlersReturn,
} from '../types/devices.types'

// Schemas
import type { DeviceFormValues } from '../schemas/device.schema'

/**
 * Hook que centraliza a lógica de handlers da página de dispositivos.
 *
 * Gerencia o estado do dialog (criação/edição), o target de exclusão, o
 * target de detalhe (aberto no clique da linha), o target de rotação de token
 * (com confirmação) e o token recém-gerado (exibido uma única vez).
 *
 * @param params - Dependências: updateSearch, search e mutations.
 * @returns Estados e handlers para a página.
 */
export function useDeviceHandlers({
  updateSearch,
  search,
  createDevice,
  updateDevice,
  deleteDevice,
  rotateToken,
}: UseDeviceHandlersParams): UseDeviceHandlersReturn {
  // --- Estados ---
  const [formState, setFormState] = useState<DeviceDialogState>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeviceDeleteTarget | null>(null)
  const [detailTarget, setDetailTarget] = useState<DeviceEntity | null>(null)
  const [rotateTarget, setRotateTarget] = useState<DeviceRotateTarget | null>(null)
  const [tokenTarget, setTokenTarget] = useState<DeviceTokenTarget | null>(null)

  // --- Filtros (server-side, sincronizados na URL) ---

  /** Valor atual do filtro de status. */
  const statusValue: DeviceStatusFilterValue =
    search.isActive === undefined ? 'all' : search.isActive ? 'active' : 'inactive'

  /**
   * Atualiza o filtro de status na URL.
   *
   * @param value - 'all' | 'active' | 'inactive'.
   */
  const handleStatusChange = (value: DeviceStatusFilterValue) => {
    if (value === 'all') {
      updateSearch({ isActive: undefined })
      return
    }
    updateSearch({ isActive: value === 'active' })
  }

  // --- Dialogs ---

  /** Abre o dialog de criação. */
  const handleOpenCreate = () => {
    setFormState({ mode: 'create' })
  }

  /** Abre o dialog de edição de um dispositivo. */
  const handleOpenEdit = (device: DeviceEntity) => {
    setFormState({ mode: 'edit', device })
  }

  /** Fecha o dialog de formulário. */
  const handleCloseForm = () => {
    setFormState(null)
  }

  /** Abre o detalhe do dispositivo (clique na linha). */
  const handleOpenDetail = (device: DeviceEntity) => {
    setDetailTarget(device)
  }

  /** Fecha o detalhe do dispositivo. */
  const handleCloseDetail = () => {
    setDetailTarget(null)
  }

  /** Abre a confirmação de rotação de token. */
  const handleOpenRotate = (device: DeviceEntity) => {
    setRotateTarget({ id: device.id, name: device.name })
  }

  /** Fecha a confirmação de rotação de token. */
  const handleCloseRotate = () => {
    setRotateTarget(null)
  }

  /**
   * Submete o formulário (criação/edição).
   *
   * Na criação, abre o dialog de token (write-only) com o token gerado pelo
   * backend. Na edição, apenas fecha (o toast de sucesso vem da mutation).
   *
   * @param values Valores validados do formulário.
   */
  const handleSubmitForm = async (values: DeviceFormValues) => {
    if (!formState) {
      return
    }

    if (formState.mode === 'create') {
      const result = await createDevice.mutateAsync(toCreateDevicePayload(values))
      setTokenTarget(result)
      setFormState(null)
      return
    }

    const original = normalizeDeviceFormDefaults(formState.device)
    const payload = toUpdateDevicePayload(values, original)
    await updateDevice.mutateAsync({ deviceId: formState.device.id, payload })
    setFormState(null)
  }

  /** Confirma a rotação de token (abre o dialog de token com o novo token). */
  const handleConfirmRotate = useCallback(async () => {
    if (!rotateTarget) {
      return
    }
    const result = await rotateToken.mutateAsync(rotateTarget.id)
    setTokenTarget(result)
    setRotateTarget(null)
  }, [rotateTarget, rotateToken])

  /** Confirma a exclusão física do dispositivo. */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return
    }
    await deleteDevice.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }, [deleteTarget, deleteDevice])

  return {
    formState,
    setFormState,
    deleteTarget,
    setDeleteTarget,
    detailTarget,
    setDetailTarget,
    rotateTarget,
    setRotateTarget,
    tokenTarget,
    setTokenTarget,
    statusValue,
    handleStatusChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDetail,
    handleCloseDetail,
    handleSubmitForm,
    handleOpenRotate,
    handleCloseRotate,
    handleConfirmRotate,
    handleConfirmDelete,
  }
}
