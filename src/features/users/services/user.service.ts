// Mapper
import { buildUserListQuery } from '../mappers/user.mapper'

// Types
import type {
  CreateUserPayload,
  CreateUserResponse,
  EmailStatusResponse,
  UpdateUserPayload,
  UserEntity,
  UserListParams,
  UserListResponse,
} from '../types/users.types'

// Controller
import baseController from '#/shared/controller/base.controller'

/**
 * Service de usuários.
 *
 * Responsável por toda comunicação com a API de usuários (`/users`).
 * Contrato (ADR 0005 + Fase 0): listagem paginada com filtros server-side e
 * catálogo de cargos nos `parameters` (chave `role_id`), criação já vinculada
 * (com `roleId`), edição parcial (com replace de cargo), desativação soft e
 * troca de senha.
 */
class UsersService {
  /**
   * Lista usuários da empresa da sessão (paginado, filtros server-side).
   *
   * A resposta traz `parameters` com os **cargos ativos** da empresa (chave
   * `role_id`) para o Select do formulário — mesmo padrão de veículos
   * (ADR 0006 §11). Isso evita depender de `GET /roles` (MANAGE_ROLES) na
   * página de usuários.
   *
   * @param params Busca, filtros e paginação.
   * @returns Envelope paginado `{ limit, offset, data, count, parameters }`.
   */
  async list(params: UserListParams): Promise<UserListResponse> {
    const query = buildUserListQuery(params)

    return baseController.makeRequest({
      endpoint: `/users?${query}`,
      method: 'GET',
    })
  }

  /**
   * Consulta se já existe conta com aquele e-mail (modo "vincular").
   *
   * @param email E-mail a consultar.
   * @returns `{ exists }` — sem vazar dados de quem usa o sistema.
   */
  async emailStatus(email: string): Promise<EmailStatusResponse> {
    return baseController.makeRequest({
      endpoint: `/users/email-status?email=${encodeURIComponent(email)}`,
      method: 'GET',
    })
  }

  /**
   * Cria um usuário já vinculado à empresa da sessão.
   *
   * Pessoa nova → cria pessoa + vínculo + cargo (roleId); pessoa existente →
   * apenas vínculo + cargo. O backend rejeita dados pessoais/senha no vínculo
   * (400) — o frontend usa `toLinkUserPayload` nesse caso.
   *
   * @param payload Dados de criação (inclui `roleId` — Fase 0).
   * @returns Usuário com `createdUser` indicando se a pessoa era nova.
   */
  async create(payload: CreateUserPayload): Promise<CreateUserResponse> {
    return baseController.makeRequest({
      endpoint: '/users',
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Edita parcialmente um usuário da empresa.
   *
   * @param userId Id da pessoa.
   * @param payload Campos alterados (diff); `roleId` faz replace do cargo.
   * @returns Usuário atualizado.
   */
  async update(userId: string, payload: UpdateUserPayload): Promise<UserEntity> {
    return baseController.makeRequest({
      endpoint: `/users/${userId}`,
      method: 'PATCH',
      body: payload,
    })
  }

  /**
   * Exclui a participação do usuário na empresa (DELETE = exclusão física no
   * backend — remove user_role e user_company; se for a última empresa da
   * pessoa sem histórico operacional, remove também a pessoa — ADR 0005 §4).
   *
   * @param userId Id da pessoa.
   */
  async remove(userId: string): Promise<void> {
    await baseController.makeRequest({
      endpoint: `/users/${userId}`,
      method: 'DELETE',
    })
  }

  /**
   * Troca a senha de um usuário (provisório — MANAGE_USERS).
   *
   * @param userId Id da pessoa.
   * @param newPassword Nova senha (mínimo 6 caracteres).
   */
  async changePassword(userId: string, newPassword: string): Promise<void> {
    return baseController.makeRequest({
      endpoint: `/users/${userId}/password`,
      method: 'PATCH',
      body: { newPassword },
    })
  }
}

export const usersService = new UsersService()
