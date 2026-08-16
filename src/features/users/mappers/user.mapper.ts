// Schemas
import type { UserFormValues } from '../schemas/user.schema'

// Types
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserEntity,
  UserListParams,
} from '../types/users.types'

/**
 * Normaliza os valores padrão do formulário de usuário.
 *
 * Com entidade (edição) preenche com os dados existentes — incluindo o cargo
 * vigente (`role.roleId`, 1 cargo por empresa). Sem ela, valores vazios.
 *
 * @param user Entidade de usuário opcional (modo edição).
 * @returns Valores padrão para o formulário.
 */
export function normalizeUserFormDefaults(user?: UserEntity): UserFormValues {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    phone: user?.phone ?? '',
    document: user?.document ?? '',
    observation: user?.observation ?? '',
    type: user?.type ?? 'EMPLOYEE',
    isActive: user?.isActive ?? true,
    roleId: user?.role?.roleId ?? '',
  }
}

/**
 * Converte os valores do formulário no payload de criação (pessoa nova).
 *
 * Inclui `roleId` — o backend (Fase 0) cria pessoa + vínculo + cargo na mesma
 * transação. Campos vazios de dados da pessoa viram `undefined` (não enviados).
 *
 * @param values Valores validados do formulário.
 * @returns Payload de criação.
 */
export function toCreateUserPayload(values: UserFormValues): CreateUserPayload {
  return {
    email: values.email.trim(),
    type: values.type,
    name: values.name.trim(),
    password: values.password,
    phone: values.phone?.trim() || undefined,
    document: values.document?.trim() || undefined,
    observation: values.observation?.trim() || undefined,
    roleId: values.roleId,
  }
}

/**
 * Converte os valores do formulário no payload de vínculo (pessoa já existe).
 *
 * Apenas e-mail, tipo e cargo — o backend rejeita (400) dados da pessoa/senha
 * no vínculo (ADR 0005 §2).
 *
 * @param values Valores validados do formulário.
 * @returns Payload de vínculo.
 */
export function toLinkUserPayload(values: UserFormValues): CreateUserPayload {
  return {
    email: values.email.trim(),
    type: values.type,
    roleId: values.roleId,
  }
}

/**
 * Converte os valores do formulário no payload de edição (diff).
 *
 * Só campos alterados são enviados (PATCH parcial). `roleId` vazio ("sem
 * cargo") → `null` (remove o cargo); igual ao atual → não enviado.
 *
 * @param values Valores validados do formulário.
 * @param original Valores originais (antes da edição).
 * @returns Payload com apenas os campos alterados.
 */
export function toUpdateUserPayload(
  values: UserFormValues,
  original: UserFormValues,
): UpdateUserPayload {
  const payload: UpdateUserPayload = {}

  if (values.name.trim() !== original.name.trim()) {
    payload.name = values.name.trim()
  }

  if (values.email.trim() !== original.email.trim()) {
    payload.email = values.email.trim()
  }

  const phone = values.phone?.trim() || null
  const originalPhone = original.phone?.trim() || null
  if (phone !== originalPhone) {
    payload.phone = phone
  }

  const document = values.document?.trim() || null
  const originalDocument = original.document?.trim() || null
  if (document !== originalDocument) {
    payload.document = document
  }

  const observation = values.observation?.trim() || null
  const originalObservation = original.observation?.trim() || null
  if (observation !== originalObservation) {
    payload.observation = observation
  }

  if (values.type !== original.type) {
    payload.type = values.type
  }

  if (values.isActive !== original.isActive) {
    payload.isActive = values.isActive
  }

  const roleId = values.roleId?.trim() || null
  const originalRoleId = original.roleId?.trim() || null
  if (roleId !== originalRoleId) {
    payload.roleId = roleId
  }

  return payload
}

/**
 * Diz se uma nova senha foi digitada no formulário (edição → troca de senha).
 *
 * @param values Valores do formulário.
 * @returns `true` quando o campo senha tem conteúdo.
 */
export function isPasswordChanged(values: UserFormValues): boolean {
  return (values.password ?? '').trim().length > 0
}

/**
 * Monta a query string da listagem de usuários (filtros server-side).
 *
 * @param params Busca, filtros e paginação.
 * @returns Query string formatada para a URL.
 */
export function buildUserListQuery(params: UserListParams) {
  const searchParams = new URLSearchParams()

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.type) {
    searchParams.set('type', params.type)
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  searchParams.set('limit', String(params.limit))
  searchParams.set('offset', String(params.offset))

  return searchParams.toString()
}
