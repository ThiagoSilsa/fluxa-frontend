// Schemas
import type { DeviceFormValues } from '../schemas/device.schema'

/** Plataformas de dispositivo (espelho do enum `device_platform` do backend). */
export type DevicePlatform = 'ANDROID' | 'IOS'

/** Resumo da portaria vinculada ao dispositivo (detalhe/listagem). */
export type DeviceEntranceSummary = {
  id: string
  name: string
} | null

/** Entidade de dispositivo retornada pela API. */
export type DeviceEntity = {
  id: string
  name: string
  platform: DevicePlatform
  /** Versão do app (preenchida pelo app — somente leitura). */
  appVersion: string | null
  entranceId: string | null
  /** Portaria vinculada (resumo) ou null. */
  entrance: DeviceEntranceSummary
  /** Última sincronização (preenchida pelo app — somente leitura). */
  lastSyncAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Resposta de criação/rotação de token — token write-only (exibido 1x). */
export type DeviceWithTokenResponse = {
  device: DeviceEntity
  token: string
}

/** Opção de `parameters` da listagem (portarias ativas). */
export type DeviceParameterOption = {
  id: string
  name: string
}

export type DeviceListParameter = {
  key: string
  label: string
  allowed_values?: DeviceParameterOption[]
}

/** Parâmetros de listagem de dispositivos (paginada/ordenada no servidor). */
export type DeviceListParams = {
  search?: string
  isActive?: boolean
  sortBy?: 'name' | 'createdAt' | 'lastSyncAt'
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
}

/** Valor do filtro de status da listagem. */
export type DeviceStatusFilterValue = 'all' | 'active' | 'inactive'

/** Resposta da listagem de dispositivos (envelope paginado). */
export type DeviceListResponse = {
  limit: number
  offset: number
  data: DeviceEntity[]
  count: number
  parameters?: DeviceListParameter[]
}

/** Payload para criação de dispositivo. */
export type CreateDevicePayload = {
  name: string
  platform: DevicePlatform
  entranceId?: string
}

/** Payload para atualização de dispositivo (PATCH parcial). */
export type UpdateDevicePayload = {
  name?: string
  /** Id da portaria, `null` para desvincular. */
  entranceId?: string | null
  isActive?: boolean
}

/** Estado do dialog de formulário de dispositivo. */
export type DeviceDialogState = { mode: 'create' } | { mode: 'edit'; device: DeviceEntity } | null

/** Target de exclusão de dispositivo. */
export type DeviceDeleteTarget = {
  id: string
  name: string
}

/** Target de rotação de token (aguardando confirmação). */
export type DeviceRotateTarget = {
  id: string
  name: string
}

/** Token recém-gerado (criação/rotação) para exibição única. */
export type DeviceTokenTarget = {
  device: DeviceEntity
  token: string
}

/** Parâmetros do hook central de handlers da página. */
export type UseDeviceHandlersParams = {
  updateSearch: (params: Record<string, unknown>) => void
  search: { isActive?: boolean }
  createDevice: {
    mutateAsync: (payload: CreateDevicePayload) => Promise<DeviceWithTokenResponse>
  }
  updateDevice: {
    mutateAsync: (args: { deviceId: string; payload: UpdateDevicePayload }) => Promise<DeviceEntity>
  }
  deleteDevice: { mutateAsync: (deviceId: string) => Promise<void> }
  rotateToken: {
    mutateAsync: (deviceId: string) => Promise<DeviceWithTokenResponse>
  }
}

/** Retorno do hook central de handlers da página. */
export type UseDeviceHandlersReturn = {
  formState: DeviceDialogState
  setFormState: React.Dispatch<React.SetStateAction<DeviceDialogState>>
  deleteTarget: DeviceDeleteTarget | null
  setDeleteTarget: React.Dispatch<React.SetStateAction<DeviceDeleteTarget | null>>
  detailTarget: DeviceEntity | null
  setDetailTarget: React.Dispatch<React.SetStateAction<DeviceEntity | null>>
  rotateTarget: DeviceRotateTarget | null
  setRotateTarget: React.Dispatch<React.SetStateAction<DeviceRotateTarget | null>>
  tokenTarget: DeviceTokenTarget | null
  setTokenTarget: React.Dispatch<React.SetStateAction<DeviceTokenTarget | null>>
  statusValue: DeviceStatusFilterValue
  handleStatusChange: (value: DeviceStatusFilterValue) => void
  handleOpenCreate: () => void
  handleOpenEdit: (device: DeviceEntity) => void
  handleCloseForm: () => void
  handleOpenDetail: (device: DeviceEntity) => void
  handleCloseDetail: () => void
  handleSubmitForm: (values: DeviceFormValues) => void
  handleOpenRotate: (device: DeviceEntity) => void
  handleCloseRotate: () => void
  handleConfirmRotate: () => void
  handleConfirmDelete: () => void
}
