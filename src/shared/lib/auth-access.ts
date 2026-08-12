// Types

/**
 * Verifica se o usuario atende aos requisitos de acesso.
 * Regra: role tem precedencia sobre permissions.
 */
export function canAccess(user: any | null, requirements: any) {
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
