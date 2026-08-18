// Schemas
import type { EntranceFormValues } from '../schemas/entrance.schema'

/** Entidade de portaria retornada pela API. */
export type EntranceEntity = {
  id: string
  name: string
  isActive: boolean
}

/** Parâmetros de listagem de portarias (paginada no servidor). */
export type EntranceListParams = {
  search?: string
  isActive?: boolean
  limit?: number
  offset?: number
}

/** Valor do filtro de status da listagem de portarias. */
export type EntranceStatusFilterValue = 'all' | 'active' | 'inactive'

/** Resposta da listagem de portarias (envelope paginado). */
export type EntranceListResponse = {
  limit: number
  offset: number
  data: EntranceEntity[]
  count: number
}

/** Payload para criação de uma portaria. */
export type CreateEntrancePayload = {
  name: string
}

/** Payload para atualização de uma portaria. */
export type UpdateEntrancePayload = {
  name?: string
  /** Novo status ativo/inativo (opcional — desativa/reativa a portaria). */
  isActive?: boolean
}

/** Estado do dialog de formulário de portaria. */
export type EntranceDialogState = {
  mode: 'create' | 'edit'
  entrance?: EntranceEntity
} | null

/** Target de exclusão de portaria. */
export type EntranceDeleteTarget = {
  id: string
  name: string
}

/** Props do card de portaria. */
export type EntranceCardProps = {
  entrance: EntranceEntity
  onEdit: (entrance: EntranceEntity) => void
  onDelete: (target: EntranceDeleteTarget) => void
  canManage: boolean
}

/** Props do formulário de portaria (criação/edição unificado). */
export type EntranceFormProps = {
  defaultValues: EntranceFormValues
  onSubmit: (values: EntranceFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel: string
  mode: 'create' | 'edit'
}

/** Parâmetros do hook central de handlers da página. */
export type UseEntranceHandlersParams = {
  updateSearch: (params: Record<string, unknown>) => void
  search: { isActive?: boolean }
  createEntrance: {
    mutateAsync: (payload: CreateEntrancePayload) => Promise<EntranceEntity>
  }
  updateEntrance: {
    mutateAsync: (args: {
      entranceId: string
      payload: UpdateEntrancePayload
    }) => Promise<EntranceEntity>
  }
  deleteEntrance: { mutateAsync: (entranceId: string) => Promise<void> }
}

/** Retorno do hook central de handlers da página. */
export type UseEntranceHandlersReturn = {
  formState: EntranceDialogState
  setFormState: React.Dispatch<React.SetStateAction<EntranceDialogState>>
  deleteTarget: EntranceDeleteTarget | null
  setDeleteTarget: React.Dispatch<React.SetStateAction<EntranceDeleteTarget | null>>
  statusValue: EntranceStatusFilterValue
  handleStatusChange: (value: EntranceStatusFilterValue) => void
  handleOpenCreate: () => void
  handleOpenEdit: (entrance: EntranceEntity) => void
  handleCloseForm: () => void
  handleSubmitForm: (values: EntranceFormValues) => Promise<void>
  handleConfirmDelete: () => Promise<void>
}
