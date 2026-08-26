// Types
import type { UserListResponse, UserRoleOption } from '../types/users.types'

/**
 * Deriva as opções de cargo para o Select do formulário a partir dos
 * `parameters` da listagem de usuários (`GET /users`).
 *
 * O backend já retorna apenas cargos **ativos** em `allowed_values` (chave
 * `role_id`) — mesmo padrão de veículos (ADR 0006 §11). Isso evita a
 * dependência de `GET /roles` (permissão MANAGE_ROLES) na página de usuários:
 * quem gerencia usuários mas não cargos continua podendo atribuir cargos.
 *
 * Cargos `is_admin` só aparecem para quem pode gerenciar administradores
 * (ator `is_admin` — 403 no backend caso contrário).
 *
 * @param canManageAdmin Se o ator pode atribuir cargos de administração.
 * @param usersData Resposta da listagem de usuários (ou `undefined`).
 * @returns Opções de cargo para o Select.
 */
export function useRoleOptions(
  canManageAdmin: boolean,
  usersData?: UserListResponse,
): UserRoleOption[] {
  const roles =
    usersData?.parameters?.find((parameter) => parameter.key === 'role_id')?.allowed_values ?? []

  return roles
    .filter((role) => canManageAdmin || !role.isAdmin)
    .map((role) => ({
      id: role.id,
      name: role.name,
      isAdmin: role.isAdmin ?? false,
      isActive: true, // o backend já filtra apenas ativos
    }))
}
