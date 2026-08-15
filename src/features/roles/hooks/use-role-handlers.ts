// React
import { useCallback, useState } from 'react'

// Mappers
import { toCreateRolePayload, toUpdateRolePayload } from '../mappers/role.mapper'

// Types
import type {
  RoleDeleteTarget,
  RoleDialogState,
  RoleEntity,
  UseRoleHandlersParams,
  UseRoleHandlersReturn,
} from '../types/roles.types'

// Schemas
import type { RoleFormValues } from '../schemas/role-form.schema'

/**
 * Hook que centraliza a lógica de handlers da página de cargos.
 *
 * Gerencia o estado dos dialogs (formulário e permissões), o target de
 * desativação e os submits. Sem filtro de status: o backend não filtra por
 * `isActive` na listagem (contrato: apenas `search`, `limit`, `offset`).
 *
 * @param params - Mutations necessárias (create, update, deactivate).
 * @returns Estados e handlers para a página.
 */
export function useRoleHandlers({
  createRole,
  updateRole,
  deactivateRole,
}: UseRoleHandlersParams): UseRoleHandlersReturn {
  // --- Estados ---
  const [formState, setFormState] = useState<RoleDialogState>(null)
  const [deleteTarget, setDeleteTarget] = useState<RoleDeleteTarget | null>(null)
  const [permissionsRole, setPermissionsRole] = useState<RoleEntity | null>(null)

  // --- Handlers de dialog de formulário ---

  /** Abre o dialog de criação. */
  const handleOpenCreate = () => {
    setFormState({ mode: 'create' })
  }

  /**
   * Abre o dialog de edição.
   *
   * @param role - Entidade do cargo a editar.
   */
  const handleOpenEdit = (role: RoleEntity) => {
    setFormState({ mode: 'edit', role })
  }

  /** Fecha o dialog de formulário. */
  const handleCloseForm = () => {
    setFormState(null)
  }

  /**
   * Submete o formulário de criação/edição.
   *
   * @param values - Valores validados do formulário.
   */
  const handleSubmitForm = async (values: RoleFormValues) => {
    try {
      if (formState?.mode === 'create') {
        await createRole.mutateAsync(toCreateRolePayload(values))
      } else if (formState?.mode === 'edit' && formState.role) {
        await updateRole.mutateAsync({
          roleId: formState.role.id,
          payload: toUpdateRolePayload(values),
        })
      }

      setFormState(null)
    } catch {
      // O erro já foi tratado no onError da mutation (toast).
    }
  }

  // --- Handlers de dialog de permissões ---

  /**
   * Abre o dialog de gerenciamento de permissões de um cargo.
   *
   * @param role - Entidade do cargo.
   */
  const handleOpenPermissions = (role: RoleEntity) => {
    setPermissionsRole(role)
  }

  /** Fecha o dialog de permissões. */
  const handleClosePermissions = () => {
    setPermissionsRole(null)
  }

  // --- Handler de desativação ---

  /**
   * Confirma a desativação de um cargo.
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return

    try {
      await deactivateRole.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // O erro já foi tratado no onError da mutation (toast).
    }
  }, [deleteTarget, deactivateRole])

  return {
    formState,
    setFormState,
    deleteTarget,
    setDeleteTarget,
    permissionsRole,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleSubmitForm,
    handleConfirmDelete,
    handleOpenPermissions,
    handleClosePermissions,
  }
}
