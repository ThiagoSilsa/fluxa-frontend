// Schemas
import type { UserFormValues } from '../schemas/user.schema'

/** Tipo do usuário no vínculo pessoa ↔ empresa (espelho do backend). */
export const USER_TYPES = ['EMPLOYEE', 'VISITOR'] as const

export type UserTypeValue = (typeof USER_TYPES)[number]

/** Resumo do cargo vigente do usuário na empresa (1 cargo por empresa). */
export type UserRoleSummary = {
  userRoleId: string
  roleId: string
  roleName: string
  isAdmin: boolean
}

/** Entidade de usuário retornada pela API (pessoa + vínculo). */
export type UserEntity = {
  id: string
  name: string
  email: string
  phone: string | null
  document: string | null
  observation: string | null
  photoUrl: string | null
  type: UserTypeValue
  isActive: boolean
  role: UserRoleSummary | null
}

/** Parâmetros de listagem de usuários (filtros server-side + paginação). */
export type UserListParams = {
  search?: string
  type?: UserTypeValue
  isActive?: boolean
  limit: number
  offset: number
}

/** Resposta da listagem de usuários (envelope paginado). */
export type UserListResponse = {
  limit: number
  offset: number
  data: UserEntity[]
  count: number
}

/** Payload de criação de usuário (pessoa nova já vinculada com cargo). */
export type CreateUserPayload = {
  email: string
  type: UserTypeValue
  name?: string
  password?: string
  phone?: string
  document?: string
  observation?: string
  roleId?: string
}

/** Payload de edição parcial de usuário (diff — campos alterados). */
export type UpdateUserPayload = {
  name?: string
  email?: string
  phone?: string | null
  document?: string | null
  observation?: string | null
  type?: UserTypeValue
  isActive?: boolean
  /** UUID → troca o cargo; `null` → remove o cargo. */
  roleId?: string | null
}

/** Resposta de criação — indica se a pessoa foi criada ou só vinculada. */
export type CreateUserResponse = UserEntity & { createdUser: boolean }

/** Resposta da consulta de existência por e-mail (modo vincular). */
export type EmailStatusResponse = { exists: boolean }

/** Estado do dialog de formulário de usuário. */
export type UserDialogState = {
  mode: 'create' | 'edit'
  user?: UserEntity
} | null

/** Target de desativação de usuário. */
export type UserDeleteTarget = { id: string; name: string }

/** Valores possíveis do filtro de status. */
export type UserStatusFilterValue = 'all' | 'active' | 'inactive'

/** Valores possíveis do filtro de tipo. */
export type UserTypeFilterValue = 'all' | UserTypeValue

/** Opção de cargo para o Select do formulário (catálogo `GET /roles`). */
export type UserRoleOption = {
  id: string
  name: string
  isAdmin: boolean
  isActive: boolean
}

/** Props do formulário de usuário (criação/vínculo/edição). */
export type UserFormProps = {
  defaultValues: UserFormValues
  onSubmit: (values: UserFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel: string
  readOnly?: boolean
  mode: 'create' | 'edit'
  /** Se true, o formulário está em modo "vincular" (pessoa já existente). */
  isLink?: boolean
  /** Catálogo de cargos disponíveis (apenas ativos). */
  roleOptions: UserRoleOption[]
  /** Se o ator pode atribuir cargos de administração. */
  canManageAdmin: boolean
  /** Se o alvo é cargo is_admin (form de leitura para não-admin). */
  isAdminTarget: boolean
}
