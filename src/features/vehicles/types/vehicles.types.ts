// Schemas
import type { VehicleFormValues } from '../schemas/vehicle.schema'

/** Resumo do tipo de veículo agregado ao veículo. */
export type VehicleTypeSummary = {
  id: string
  code: string
  name: string
  isFleet: boolean
}

/** Entidade de veículo retornada pela API (listagem). */
export type VehicleEntity = {
  id: string
  plate: string
  model: string | null
  color: string | null
  observation: string | null
  /** Derivado do bloqueio ativo — somente leitura. */
  isBlocked: boolean
  freePass: boolean
  vehicleTypeId: string
  vehicleType: VehicleTypeSummary | null
  isActive: boolean
  /** Data de criação (ISO) — ordenável na listagem. */
  createdAt: string
}

/** Motorista vinculado a um veículo. */
export type VehicleDriver = {
  id: string
  vehicleId: string
  user: { id: string; name: string }
  isPrimary: boolean
  canDrive: boolean
}

/** Candidato a motorista (pessoa com vínculo ativo na empresa). */
export type DriverCandidate = {
  id: string
  name: string
}

/** Vínculo de departamento padrão do veículo. */
export type VehicleDepartmentLink = {
  id: string
  vehicleId: string
  departmentId: string
  department: { id: string; name: string } | null
  isActive: boolean
}

/** QR code de veículo (tabela `vehicle_qr_code` — ADR 0009). */
export type VehicleQrEntity = {
  id: string
  vehicleId: string
  /** Token permanente (uuid) — o que o QR code representa. */
  code: string
  /** Ativo (revogado/reemitido = "expirado" — não resolve). */
  isActive: boolean
  /** Quem emitiu (auditoria) ou null. */
  issuedBy: string | null
  /** Data de emissão (ISO). */
  createdAt: string
}

/** Detalhe agregado do veículo (`GET /vehicles/:id`). */
export type VehicleDetail = VehicleEntity & {
  department: { id: string; name: string } | null
  drivers: VehicleDriver[]
}

/** Opção de `parameters` da listagem (tipos/departamentos ativos). */
export type VehicleParameterOption = {
  id: string
  name: string
}

export type VehicleListParameter = {
  key: string
  label: string
  allowed_values?: VehicleParameterOption[]
}

/** Parâmetros de listagem de veículos (paginada/ordenada no servidor). */
export type VehicleListParams = {
  search?: string
  vehicleTypeId?: string
  departmentId?: string
  freePass?: boolean
  isActive?: boolean
  sortBy?: 'plate' | 'isActive' | 'createdAt'
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
}

/** Valor do filtro de status da listagem. */
export type VehicleStatusFilterValue = 'all' | 'active' | 'inactive'

/** Valor do filtro de livre acesso da listagem. */
export type VehicleFreePassFilterValue = 'all' | 'free' | 'no-free'

/** Resposta da listagem de veículos (envelope paginado). */
export type VehicleListResponse = {
  limit: number
  offset: number
  data: VehicleEntity[]
  count: number
  parameters?: VehicleListParameter[]
}

/** Resposta de listagem de motoristas. */
export type ListVehicleDriversResponse = {
  vehicleId: string
  drivers: VehicleDriver[]
}

/** Resposta de listagem de candidatos a motorista. */
export type ListDriverCandidatesResponse = {
  limit: number
  offset: number
  data: DriverCandidate[]
  count: number
}

/** Payload para criação de veículo. */
export type CreateVehiclePayload = {
  plate: string
  vehicleTypeId: string
  model?: string | null
  color?: string | null
  observation?: string | null
  freePass?: boolean
}

/** Payload para atualização de veículo (PATCH parcial). */
export type UpdateVehiclePayload = {
  plate?: string
  model?: string | null
  color?: string | null
  observation?: string | null
  vehicleTypeId?: string
  freePass?: boolean
  isActive?: boolean
}

/** Payload para vincular motorista. */
export type AddDriverPayload = {
  userId: string
  isPrimary?: boolean
  canDrive?: boolean
}

/** Payload para atualizar motorista. */
export type UpdateDriverPayload = {
  isPrimary?: boolean
  canDrive?: boolean
}

/** Estado do dialog de formulário de veículo. */
export type VehicleDialogState =
  { mode: 'create' } | { mode: 'edit'; vehicle: VehicleEntity; departmentId?: string } | null

/** Target de exclusão de veículo. */
export type VehicleDeleteTarget = {
  id: string
  name: string
}

/** Props do formulário de veículo (criação/edição). */
export type VehicleFormProps = {
  defaultValues: VehicleFormValues
  onSubmit: (values: VehicleFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel: string
  mode: 'create' | 'edit'
}

/** Parâmetros do hook central de handlers da página. */
export type UseVehicleHandlersParams = {
  updateSearch: (params: Record<string, unknown>) => void
  search: {
    isActive?: boolean
    freePass?: boolean
    vehicleTypeId?: string
    departmentId?: string
  }
  createVehicle: { mutateAsync: (payload: CreateVehiclePayload) => Promise<VehicleEntity> }
  updateVehicle: {
    mutateAsync: (args: {
      vehicleId: string
      payload: UpdateVehiclePayload
    }) => Promise<VehicleEntity>
  }
  deleteVehicle: { mutateAsync: (vehicleId: string) => Promise<void> }
  setVehicleDepartment: {
    mutateAsync: (args: {
      vehicleId: string
      departmentId: string
    }) => Promise<VehicleDepartmentLink>
  }
  removeVehicleDepartment: { mutateAsync: (vehicleId: string) => Promise<void> }
}

/** Retorno do hook central de handlers da página. */
export type UseVehicleHandlersReturn = {
  formState: VehicleDialogState
  setFormState: React.Dispatch<React.SetStateAction<VehicleDialogState>>
  deleteTarget: VehicleDeleteTarget | null
  setDeleteTarget: React.Dispatch<React.SetStateAction<VehicleDeleteTarget | null>>
  detailTarget: VehicleEntity | null
  setDetailTarget: React.Dispatch<React.SetStateAction<VehicleEntity | null>>
  statusValue: VehicleStatusFilterValue
  handleStatusChange: (value: VehicleStatusFilterValue) => void
  freePassValue: VehicleFreePassFilterValue
  handleFreePassChange: (value: VehicleFreePassFilterValue) => void
  handleOpenCreate: () => void
  handleOpenEdit: (vehicle: VehicleEntity) => void
  handleCloseForm: () => void
  handleOpenDetail: (vehicle: VehicleEntity) => void
  handleCloseDetail: () => void
  handleCurrentDepartmentChange: (departmentId: string) => void
  handleSubmitForm: (values: VehicleFormValues) => Promise<void>
  handleConfirmDelete: () => Promise<void>
}
