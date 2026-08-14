// Types
import type { SidebarItem } from '../types/sidebar.type'
import type { AuthUser } from '#/shared/types/auth.types'

// Lib
import { canAccess } from '#/shared/lib/auth-access'

/**
 * Filtra recursivamente os itens da sidebar com base nas permissões do usuário.
 * Retorna apenas os itens que o usuário tem permissão para acessar, incluindo
 * itens pais se tiver acesso a pelo menos um filho.
 *
 * Suporta `groups`: grupos que ficarem vazios (todos itens filtrados) são
 * removidos.
 */
export function filterSidebarItems(items: SidebarItem[], user: AuthUser | null): SidebarItem[] {
  return items
    .map((item) => {
      const filteredChildren = item.children ? filterSidebarItems(item.children, user) : []

      const filteredGroups = item.groups
        ? item.groups
            .map((group) => ({
              ...group,
              items: filterSidebarItems(group.items, user),
            }))
            .filter((group) => group.items.length > 0)
        : undefined

      const canAccessSelf = canAccess(user, { permissions: item.permissions, roles: item.roles })

      const canAccessChildren = filteredChildren.length > 0

      const canAccessGroups = filteredGroups ? filteredGroups.length > 0 : false

      if (!canAccessSelf && !canAccessChildren && !canAccessGroups) {
        return null
      }

      return {
        ...item,
        children: filteredChildren,
        groups: filteredGroups,
      }
    })
    .filter(Boolean) as SidebarItem[]
}
