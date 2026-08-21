// React
import { useCallback, useState } from 'react'

// Mappers
import {
  isPasswordChanged,
  normalizeUserFormDefaults,
  toCreateUserPayload,
  toLinkUserPayload,
  toUpdateUserPayload,
} from '../mappers/user.mapper'

// Types
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserDeleteTarget,
  UserDialogState,
  UserEntity,
  UserStatusFilterValue,
  UserTypeFilterValue,
  UserTypeValue,
} from '../types/users.types'

// Schemas
import type { UserFormValues } from '../schemas/user.schema'

/** Dependências do hook central de handlers da página de usuários. */
export type UseUserHandlersParams = {
  updateSearch: (params: Record<string, unknown>) => void
  search: { isActive?: boolean; type?: UserTypeValue }
  createUser: {
    mutateAsync: (payload: CreateUserPayload) => Promise<unknown>
  }
  updateUser: {
    mutateAsync: (args: { userId: string; payload: UpdateUserPayload }) => Promise<unknown>
  }
  deleteUser: { mutateAsync: (userId: string) => Promise<unknown> }
  changePassword: {
    mutateAsync: (args: { userId: string; newPassword: string }) => Promise<unknown>
  }
}

/** Retorno do hook central de handlers da página de usuários. */
export type UseUserHandlersReturn = {
  formState: UserDialogState
  setFormState: React.Dispatch<React.SetStateAction<UserDialogState>>
  deleteTarget: UserDeleteTarget | null
  setDeleteTarget: React.Dispatch<React.SetStateAction<UserDeleteTarget | null>>
  statusValue: UserStatusFilterValue
  handleStatusChange: (value: UserStatusFilterValue) => void
  typeValue: UserTypeFilterValue
  handleTypeChange: (value: UserTypeFilterValue) => void
  handleOpenCreate: () => void
  handleOpenEdit: (user: UserEntity) => void
  handleCloseForm: () => void
  handleSubmitForm: (values: UserFormValues, isLink: boolean) => Promise<void>
  handleConfirmDelete: () => Promise<void>
}

/**
 * Hook que centraliza a lógica de handlers da página de usuários.
 *
 * Gerencia estado dos dialogs (criação/edição), target de desativação,
 * filtros de status e tipo (server-side) e os submits. Na criação, `isLink`
 * decide entre payload de pessoa nova e payload de vínculo (email-status).
 * Na edição, envia apenas o diff + troca de senha quando digitada.
 *
 * @param params Dependências: updateSearch, search e mutations.
 * @returns Estados e handlers para a página.
 */
export function useUserHandlers({
  updateSearch,
  search,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
}: UseUserHandlersParams): UseUserHandlersReturn {
  // --- Estados ---
  const [formState, setFormState] = useState<UserDialogState>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserDeleteTarget | null>(null)

  // --- Filtros (server-side, sincronizados na URL) ---

  /** Valor atual do filtro de status. */
  const statusValue: UserStatusFilterValue =
    search.isActive === undefined ? 'all' : search.isActive ? 'active' : 'inactive'

  /** Valor atual do filtro de tipo. */
  const typeValue: UserTypeFilterValue = search.type ?? 'all'

  /**
   * Atualiza o filtro de status na URL.
   *
   * @param value - 'all' | 'active' | 'inactive'.
   */
  const handleStatusChange = (value: UserStatusFilterValue) => {
    if (value === 'all') {
      updateSearch({ isActive: undefined })
      return
    }

    updateSearch({ isActive: value === 'active' })
  }

  /**
   * Atualiza o filtro de tipo na URL.
   *
   * @param value - 'all' | 'EMPLOYEE' | 'VISITOR'.
   */
  const handleTypeChange = (value: UserTypeFilterValue) => {
    updateSearch({ type: value === 'all' ? undefined : value })
  }

  // --- Dialogs ---

  /** Abre o dialog de criação. */
  const handleOpenCreate = () => {
    setFormState({ mode: 'create' })
  }

  /**
   * Abre o dialog de edição.
   *
   * @param user Entidade do usuário (lista já traz todos os dados + cargo).
   */
  const handleOpenEdit = (user: UserEntity) => {
    setFormState({ mode: 'edit', user })
  }

  /** Fecha o dialog de formulário. */
  const handleCloseForm = () => {
    setFormState(null)
  }

  /**
   * Submete o formulário de criação/vínculo/edição.
   *
   * @param values Valores validados do formulário.
   * @param isLink `true` em modo "vincular" (pessoa já existe — sem dados
   * pessoais/senha, o backend rejeita 400).
   */
  const handleSubmitForm = async (values: UserFormValues, isLink: boolean) => {
    try {
      if (formState?.mode === 'create') {
        const payload = isLink ? toLinkUserPayload(values) : toCreateUserPayload(values)
        await createUser.mutateAsync(payload)
      } else if (formState?.mode === 'edit' && formState.user) {
        const original = normalizeUserFormDefaults(formState.user)
        const payload = toUpdateUserPayload(values, original)

        if (Object.keys(payload).length > 0) {
          await updateUser.mutateAsync({
            userId: formState.user.id,
            payload,
          })
        }

        if (isPasswordChanged(values)) {
          await changePassword.mutateAsync({
            userId: formState.user.id,
            newPassword: values.password,
          })
        }
      }

      setFormState(null)
    } catch {
      // O erro já foi tratado no onError da mutation (toast).
    }
  }

  /**
   * Confirma a exclusão da participação de um usuário.
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return

    try {
      await deleteUser.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // O erro já foi tratado no onError da mutation (toast).
    }
  }, [deleteTarget, deleteUser])

  return {
    formState,
    setFormState,
    deleteTarget,
    setDeleteTarget,
    statusValue,
    handleStatusChange,
    typeValue,
    handleTypeChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleSubmitForm,
    handleConfirmDelete,
  }
}
