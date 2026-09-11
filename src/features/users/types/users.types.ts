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
  /** `null` para Visitante sem e-mail (ADR 0013). */
  email: string | null
  phone: string | null
  document: string | null
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

/** Valor do parâmetro de listagem (AGENTS.md §3 — `parameters`). */
export type UserListParameter = {
  key: string
  label: string
  /** Valores permitidos (objetos completos — ex.: cargos com `isAdmin`). */
  allowed_values?: Array<{ id: string; name: string; isAdmin?: boolean }>
}

/** Resposta da listagem de usuários (envelope paginado). */
export type UserListResponse = {
  limit: number
  offset: number
  data: UserEntity[]
  count: number
  /** Metadados da listagem (ex.: catálogo de cargos ativos p/ o Select). */
  parameters?: UserListParameter[]
}

/** Payload de criação de usuário (pessoa nova já vinculada com cargo). */
export type CreateUserPayload = {
  /** Ausente para Visitante sem e-mail (ADR 0013). */
  email?: string
  type: UserTypeValue
  name?: string
  password?: string
  phone?: string
  document?: string
  roleId?: string
}

/** Payload de edição parcial de usuário (diff — campos alterados). */
export type UpdateUserPayload = {
  name?: string
  email?: string
  phone?: string | null
  document?: string | null
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

/**
 * Opção de cargo para o Select do formulário.
 *
 * Catálogo vindo dos `parameters` do `GET /users` (cargos ativos da empresa —
 * não depende de `GET /roles`/MANAGE_ROLES).
 */
export type UserRoleOption = {
  id: string
  name: string
  isAdmin: boolean
  isActive: boolean
}

/** Props do formulário de usuário (criação/vínculo/edição). */
export type UserFormProps = {
  defaultValues: UserFormValues
  /** `isLink` indica modo "vincular" (pessoa já existente). */
  onSubmit: (values: UserFormValues, isLink: boolean) => void
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
