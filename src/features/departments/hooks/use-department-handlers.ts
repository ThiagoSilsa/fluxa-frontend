// React
import { useCallback, useState } from 'react'

// Mappers
import {
  normalizeDepartmentFormDefaults,
  toCreateDepartmentPayload,
  toUpdateDepartmentPayload,
} from '../mappers/department.mapper'

// Types
import type {
  DepartmentDeleteTarget,
  DepartmentDialogState,
  DepartmentEntity,
  DepartmentStatusFilterValue,
  UseDepartmentHandlersParams,
  UseDepartmentHandlersReturn,
} from '../types/departments.types'

// Schemas
import type { DepartmentFormValues } from '../schemas/department.schema'

/**
 * Hook que centraliza a lógica de handlers da página de departamentos.
 *
 * Gerencia o estado do dialog (criação/edição), o target de exclusão e o
 * filtro de status (server-side, sincronizado na URL), além dos submits.
 *
 * @param params - Dependências: updateSearch, search e mutations.
 * @returns Estados e handlers para a página.
 */
export function useDepartmentHandlers({
  updateSearch,
  search,
  createDepartment,
  updateDepartment,
  deleteDepartment,
}: UseDepartmentHandlersParams): UseDepartmentHandlersReturn {
  // --- Estados ---
  const [formState, setFormState] = useState<DepartmentDialogState>(null)
  const [deleteTarget, setDeleteTarget] = useState<DepartmentDeleteTarget | null>(null)

  // --- Filtros (server-side, sincronizados na URL) ---

  /** Valor atual do filtro de status. */
  const statusValue: DepartmentStatusFilterValue =
    search.isActive === undefined ? 'all' : search.isActive ? 'active' : 'inactive'

  /**
   * Atualiza o filtro de status na URL.
   *
   * @param value - 'all' | 'active' | 'inactive'.
   */
  const handleStatusChange = (value: DepartmentStatusFilterValue) => {
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
   * @param department Entidade do departamento a editar.
   */
  const handleOpenEdit = (department: DepartmentEntity) => {
    setFormState({ mode: 'edit', department })
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
  const handleSubmitForm = async (values: DepartmentFormValues) => {
    try {
      if (formState?.mode === 'create') {
        await createDepartment.mutateAsync(toCreateDepartmentPayload(values))
      } else if (formState?.mode === 'edit' && formState.department) {
        const original = normalizeDepartmentFormDefaults(formState.department)
        const payload = toUpdateDepartmentPayload(values, original)

        if (Object.keys(payload).length > 0) {
          await updateDepartment.mutateAsync({
            departmentId: formState.department.id,
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
   * Confirma a exclusão física de um departamento (409 se em uso por veículos).
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return

    try {
      await deleteDepartment.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // O erro já foi tratado no onError da mutation (toast).
    }
  }, [deleteTarget, deleteDepartment])

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
