// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { usersService } from '../services/user.service'

// Types
import type { UserRoleOption } from '../types/users.types'

/**
 * Hook que busca as opções de cargo para o Select do formulário.
 *
 * Filtra o catálogo: apenas cargos ativos; cargos `is_admin` só aparecem para
 * quem pode gerenciar administradores (ator `is_admin` — 403 no backend caso
 * contrário). Catálogo estável: cacheado por 5 minutos.
 *
 * @param canManageAdmin Se o ator pode atribuir cargos de administração.
 * @returns Opções de cargo para o Select.
 */
export function useRoleOptions(canManageAdmin: boolean): UserRoleOption[] {
  const { data } = useQuery({
    queryKey: ['user-role-options'],
    queryFn: () => usersService.listRoles(),
    staleTime: 5 * 60 * 1000,
  })

  return (data ?? []).filter((role) => role.isActive && (canManageAdmin || !role.isAdmin))
}
