import type { ComponentType } from 'react'

// Types
import type { AccessRequirements } from '#/shared/types/auth.types'

// Components
import { AuthBlock } from '#/shared/components'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

// Lib
import { canAccess } from '#/shared/lib/auth-access'

/**
 * HOC para proteger rotas com base em requisitos de acesso.
 *
 * Enquanto a sessão não está pronta renderiza nada (mesmo padrão do
 * `AuthGuard`); sem o requisito, renderiza o fallback (`AuthBlock` por
 * padrão); com acesso, renderiza o componente da página.
 *
 * @example
 * const ProtectedPage = withRouteAccess(
 *   { permissions: ['MANAGE_ROLES'] },
 *   RolesPage,
 * )
 */
export function withRouteAccess<TProps extends object>(
  requirements: AccessRequirements,
  Component: ComponentType<TProps>,
  Fallback: ComponentType = AuthBlock,
) {
  return function RouteAccessWrapper(props: TProps) {
    const { isReady, user } = useAuth()

    if (!isReady) {
      return null
    }

    if (!canAccess(user, requirements)) {
      return <Fallback />
    }

    return <Component {...props} />
  }
}
