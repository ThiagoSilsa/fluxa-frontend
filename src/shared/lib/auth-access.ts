// Types
import type { AccessRequirements, AuthUser } from '#/shared/types/auth.types'

/**
 * Verifica se o usuário atende aos requisitos de acesso.
 *
 * Regra: role tem precedência sobre permissions. Requisitos vazios → acesso
 * liberado (itens sem restrição aparecem para todos).
 *
 * @param user Usuário da sessão (null quando deslogado).
 * @param requirements Requisitos de acesso (roles e/ou permissions).
 * @returns `true` quando o usuário pode acessar.
 */
export function canAccess(user: AuthUser | null, requirements: AccessRequirements): boolean {
  const roles = requirements.roles ?? []
  const permissions = requirements.permissions ?? []

  if (roles.length === 0 && permissions.length === 0) {
    return true
  }

  if (!user) {
    return false
  }

  if (roles.length > 0) {
    const hasRole = roles.some((role) => user.roleCodes?.includes(role))
    if (hasRole) {
      return true
    }
  }

  if (permissions.length === 0) {
    return false
  }

  return permissions.some((perm) => user.permissionCodes?.includes(perm))
}
