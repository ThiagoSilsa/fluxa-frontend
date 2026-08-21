// Schemas
import type { DepartmentFormValues } from '../schemas/department.schema'

/** Entidade de departamento retornada pela API. */
export type DepartmentEntity = {
  id: string
  name: string
  description: string | null
  /** Vagas de estacionamento (obrigatório no cadastro; 0 = sem vagas). */
  parkingSpace: number
  isActive: boolean
}

/** Parâmetros de listagem de departamentos (paginada no servidor). */
export type DepartmentListParams = {
  search?: string
  isActive?: boolean
  limit?: number
  offset?: number
}

/** Valor do filtro de status da listagem de departamentos. */
export type DepartmentStatusFilterValue = 'all' | 'active' | 'inactive'

/** Resposta da listagem de departamentos (envelope paginado). */
export type DepartmentListResponse = {
  limit: number
  offset: number
  data: DepartmentEntity[]
  count: number
}

/** Payload para criação de um departamento. */
export type CreateDepartmentPayload = {
  name: string
  parkingSpace: number
  description?: string | null
}

/** Payload para atualização de um departamento. */
export type UpdateDepartmentPayload = {
  name?: string
  description?: string | null
  parkingSpace?: number
  /** Novo status ativo/inativo (opcional — desativa/reativa o departamento). */
  isActive?: boolean
}

/** Estado do dialog de formulário de departamento. */
export type DepartmentDialogState = {
  mode: 'create' | 'edit'
  department?: DepartmentEntity
} | null

/** Target de exclusão de departamento. */
export type DepartmentDeleteTarget = {
  id: string
  name: string
}

/** Props do card de departamento. */
export type DepartmentCardProps = {
  department: DepartmentEntity
  onEdit: (department: DepartmentEntity) => void
  onDelete: (target: DepartmentDeleteTarget) => void
  canManage: boolean
}

/** Props do formulário de departamento (criação/edição unificado). */
export type DepartmentFormProps = {
  defaultValues: DepartmentFormValues
  onSubmit: (values: DepartmentFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel: string
  mode: 'create' | 'edit'
}

/** Parâmetros do hook central de handlers da página. */
export type UseDepartmentHandlersParams = {
  updateSearch: (params: Record<string, unknown>) => void
  search: { isActive?: boolean }
  createDepartment: {
    mutateAsync: (payload: CreateDepartmentPayload) => Promise<DepartmentEntity>
  }
  updateDepartment: {
    mutateAsync: (args: {
      departmentId: string
      payload: UpdateDepartmentPayload
    }) => Promise<DepartmentEntity>
  }
  deleteDepartment: { mutateAsync: (departmentId: string) => Promise<void> }
}

/** Retorno do hook central de handlers da página. */
export type UseDepartmentHandlersReturn = {
  formState: DepartmentDialogState
  setFormState: React.Dispatch<React.SetStateAction<DepartmentDialogState>>
  deleteTarget: DepartmentDeleteTarget | null
  setDeleteTarget: React.Dispatch<React.SetStateAction<DepartmentDeleteTarget | null>>
  statusValue: DepartmentStatusFilterValue
  handleStatusChange: (value: DepartmentStatusFilterValue) => void
  handleOpenCreate: () => void
  handleOpenEdit: (department: DepartmentEntity) => void
  handleCloseForm: () => void
  handleSubmitForm: (values: DepartmentFormValues) => Promise<void>
  handleConfirmDelete: () => Promise<void>
}
