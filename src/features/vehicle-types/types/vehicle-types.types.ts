// Schemas
import type { VehicleTypeFormValues } from '../schemas/vehicle-type.schema'

/** Entidade de tipo de veículo retornada pela API. */
export type VehicleTypeEntity = {
  id: string
  /** Código normalizado (uppercase/trim), único por empresa. */
  code: string
  name: string
  description: string | null
  /** Classificação de frota (relatórios) — não muda ocupação. */
  isFleet: boolean
  isActive: boolean
}

/** Parâmetros de listagem de tipos (paginada no servidor). */
export type VehicleTypeListParams = {
  search?: string
  isFleet?: boolean
  isActive?: boolean
  limit?: number
  offset?: number
}

/** Valor do filtro de status da listagem de tipos. */
export type VehicleTypeStatusFilterValue = 'all' | 'active' | 'inactive'

/** Valor do filtro de frota da listagem de tipos. */
export type VehicleTypeFleetFilterValue = 'all' | 'fleet' | 'non-fleet'

/** Resposta da listagem de tipos (envelope paginado). */
export type VehicleTypeListResponse = {
  limit: number
  offset: number
  data: VehicleTypeEntity[]
  count: number
}

/** Payload para criação de um tipo de veículo. */
export type CreateVehicleTypePayload = {
  code: string
  name: string
  description?: string | null
  isFleet?: boolean
}

/** Payload para atualização de um tipo de veículo. */
export type UpdateVehicleTypePayload = {
  code?: string
  name?: string
  description?: string | null
  isFleet?: boolean
  /** Novo status ativo/inativo (opcional — desativa/reativa o tipo). */
  isActive?: boolean
}

/** Estado do dialog de formulário de tipo de veículo. */
export type VehicleTypeDialogState = {
  mode: 'create' | 'edit'
  vehicleType?: VehicleTypeEntity
} | null

/** Target de exclusão de tipo de veículo. */
export type VehicleTypeDeleteTarget = {
  id: string
  name: string
}

/** Props do card de tipo de veículo. */
export type VehicleTypeCardProps = {
  vehicleType: VehicleTypeEntity
  onEdit: (vehicleType: VehicleTypeEntity) => void
  onDelete: (target: VehicleTypeDeleteTarget) => void
  canManage: boolean
}

/** Props do formulário de tipo de veículo (criação/edição unificado). */
export type VehicleTypeFormProps = {
  defaultValues: VehicleTypeFormValues
  onSubmit: (values: VehicleTypeFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel: string
  mode: 'create' | 'edit'
}

/** Parâmetros do hook central de handlers da página. */
export type UseVehicleTypeHandlersParams = {
  updateSearch: (params: Record<string, unknown>) => void
  search: { isActive?: boolean; isFleet?: boolean }
  createVehicleType: {
    mutateAsync: (payload: CreateVehicleTypePayload) => Promise<VehicleTypeEntity>
  }
  updateVehicleType: {
    mutateAsync: (args: {
      vehicleTypeId: string
      payload: UpdateVehicleTypePayload
    }) => Promise<VehicleTypeEntity>
  }
  deleteVehicleType: { mutateAsync: (vehicleTypeId: string) => Promise<void> }
}

/** Retorno do hook central de handlers da página. */
export type UseVehicleTypeHandlersReturn = {
  formState: VehicleTypeDialogState
  setFormState: React.Dispatch<React.SetStateAction<VehicleTypeDialogState>>
  deleteTarget: VehicleTypeDeleteTarget | null
  setDeleteTarget: React.Dispatch<React.SetStateAction<VehicleTypeDeleteTarget | null>>
  statusValue: VehicleTypeStatusFilterValue
  handleStatusChange: (value: VehicleTypeStatusFilterValue) => void
  isFleetValue: VehicleTypeFleetFilterValue
  handleIsFleetChange: (value: VehicleTypeFleetFilterValue) => void
  handleOpenCreate: () => void
  handleOpenEdit: (vehicleType: VehicleTypeEntity) => void
  handleCloseForm: () => void
  handleSubmitForm: (values: VehicleTypeFormValues) => Promise<void>
  handleConfirmDelete: () => Promise<void>
}
