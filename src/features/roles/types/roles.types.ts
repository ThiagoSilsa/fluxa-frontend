// Schemas
import type { RoleFormValues } from '../schemas/role-form.schema'

/** Entidade de cargo retornada pela API. */
export type RoleEntity = {
  id: string
  name: string
  description: string | null
  /** Cargo do sistema (is_admin): somente leitura na tela. */
  isAdmin: boolean
  isActive: boolean
}

/** Parâmetros de listagem de cargos (paginada no servidor). */
export type RoleListParams = {
  search?: string
  limit?: number
  offset?: number
}

/** Resposta da listagem de cargos (envelope paginado). */
export type RoleListResponse = {
  limit: number
  offset: number
  data: RoleEntity[]
  count: number
}

/** Payload para criação de um cargo. */
export type CreateRolePayload = {
  name: string
  description?: string | null
}

/** Payload para atualização de um cargo. */
export type UpdateRolePayload = {
  name?: string
  description?: string | null
  /** Novo status ativo/inativo (opcional — desativa/reativa o cargo). */
  isActive?: boolean
}

/** Entidade de permissão retornada pela API. */
export type PermissionEntity = {
  id: string
  code: string
  description: string
}

/** Permissões de um cargo: já vinculadas + catálogo disponível. */
export type RolePermissionsResponse = {
  roleId: string
  permissions: PermissionEntity[]
  available: PermissionEntity[]
}

/** Payload para vincular uma permissão a um cargo (toggle individual). */
export type AssignPermissionPayload = {
  permissionId: string
}

/** Estado do dialog de formulário de cargo. */
export type RoleDialogState = {
  mode: 'create' | 'edit'
  role?: RoleEntity
} | null

/** Target de desativação de cargo. */
export type RoleDeleteTarget = {
  id: string
  name: string
}

/** Props do card de cargo. */
export type RoleCardProps = {
  role: RoleEntity
  onEdit: (role: RoleEntity) => void
  onDelete: (target: RoleDeleteTarget) => void
  onManagePermissions: (role: RoleEntity) => void
  canManage: boolean
}

/** Props do formulário de cargo (criação/edição unificado). */
export type RoleFormProps = {
  defaultValues: RoleFormValues
  onSubmit: (values: RoleFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel: string
  /** Se true, desabilita os campos (cargo do sistema — leitura). */
  readOnly?: boolean
  mode: 'create' | 'edit'
}

/** Props do dialog de gerenciamento de permissões. */
export type RolePermissionsDialogProps = {
  /** Cargo em edição de permissões (null fecha o dialog). */
  role: RoleEntity | null
  onOpenChange: (open: boolean) => void
}

/** Parâmetros do hook central de handlers da página. */
export type UseRoleHandlersParams = {
  createRole: { mutateAsync: (payload: CreateRolePayload) => Promise<RoleEntity> }
  updateRole: {
    mutateAsync: (args: { roleId: string; payload: UpdateRolePayload }) => Promise<RoleEntity>
  }
  deactivateRole: { mutateAsync: (roleId: string) => Promise<RoleEntity> }
}

/** Retorno do hook central de handlers da página. */
export type UseRoleHandlersReturn = {
  formState: RoleDialogState
  setFormState: React.Dispatch<React.SetStateAction<RoleDialogState>>
  deleteTarget: RoleDeleteTarget | null
  setDeleteTarget: React.Dispatch<React.SetStateAction<RoleDeleteTarget | null>>
  permissionsRole: RoleEntity | null
  handleOpenCreate: () => void
  handleOpenEdit: (role: RoleEntity) => void
  handleCloseForm: () => void
  handleSubmitForm: (values: RoleFormValues) => Promise<void>
  handleConfirmDelete: () => Promise<void>
  handleOpenPermissions: (role: RoleEntity) => void
  handleClosePermissions: () => void
}
