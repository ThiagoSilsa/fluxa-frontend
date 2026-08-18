// React
import { useCallback, useState } from 'react'

// Mappers
import {
  normalizeEntranceFormDefaults,
  toCreateEntrancePayload,
  toUpdateEntrancePayload,
} from '../mappers/entrance.mapper'

// Types
import type {
  EntranceDeleteTarget,
  EntranceDialogState,
  EntranceEntity,
  EntranceStatusFilterValue,
  UseEntranceHandlersParams,
  UseEntranceHandlersReturn,
} from '../types/entrances.types'

// Schemas
import type { EntranceFormValues } from '../schemas/entrance.schema'

/**
 * Hook que centraliza a lógica de handlers da página de portarias.
 *
 * Gerencia o estado do dialog (criação/edição), o target de exclusão e o
 * filtro de status (server-side, sincronizado na URL), além dos submits.
 *
 * @param params - Dependências: updateSearch, search e mutations.
 * @returns Estados e handlers para a página.
 */
export function useEntranceHandlers({
  updateSearch,
  search,
  createEntrance,
  updateEntrance,
  deleteEntrance,
}: UseEntranceHandlersParams): UseEntranceHandlersReturn {
  // --- Estados ---
  const [formState, setFormState] = useState<EntranceDialogState>(null)
  const [deleteTarget, setDeleteTarget] = useState<EntranceDeleteTarget | null>(null)

  // --- Filtros (server-side, sincronizados na URL) ---

  /** Valor atual do filtro de status. */
  const statusValue: EntranceStatusFilterValue =
    search.isActive === undefined ? 'all' : search.isActive ? 'active' : 'inactive'

  /**
   * Atualiza o filtro de status na URL.
   *
   * @param value - 'all' | 'active' | 'inactive'.
   */
  const handleStatusChange = (value: EntranceStatusFilterValue) => {
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

  /**
   * Abre o dialog de edição.
   *
   * @param entrance Entidade da portaria a editar.
   */
  const handleOpenEdit = (entrance: EntranceEntity) => {
    setFormState({ mode: 'edit', entrance })
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
  const handleSubmitForm = async (values: EntranceFormValues) => {
    try {
      if (formState?.mode === 'create') {
        await createEntrance.mutateAsync(toCreateEntrancePayload(values))
      } else if (formState?.mode === 'edit' && formState.entrance) {
        const original = normalizeEntranceFormDefaults(formState.entrance)
        const payload = toUpdateEntrancePayload(values, original)

        if (Object.keys(payload).length > 0) {
          await updateEntrance.mutateAsync({
            entranceId: formState.entrance.id,
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
   * Confirma a exclusão física de uma portaria (409 se em uso por dispositivos).
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return

    try {
      await deleteEntrance.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // O erro já foi tratado no onError da mutation (toast).
    }
  }, [deleteTarget, deleteEntrance])

  return {
    formState,
    setFormState,
    deleteTarget,
    setDeleteTarget,
    statusValue,
    handleStatusChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleSubmitForm,
    handleConfirmDelete,
  }
}
