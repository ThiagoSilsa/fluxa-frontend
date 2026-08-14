// React
import { memo, useCallback, useEffect, useState } from 'react'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

// Components
import { AppSidebar } from './sidebar'
import { MobileNavbar } from './mobile-navbar'
import { ScrollRestorationSettler, SidebarProvider } from '#/shared/components'

// Lib
import { resolveInitialUserId } from '../lib/resolve-initial-user'
import { getSidebarPreference, setSidebarPreference } from '../lib/sidebar-preference'

/**
 * Layout Principal.
 *
 * A preferência de barra lateral (expandida/retraída) é persistida em
 * `localStorage` vinculada ao usuário autenticado, restaurada ao entrar e
 * atualizada a cada alternância.
 */
function MainLayoutComponent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  // Inicializa com a preferência do usuário resolvido de forma síncrona (storage),
  // caindo para o contexto quando disponível.
  const [open, setOpen] = useState<boolean>(
    () => getSidebarPreference(userId ?? resolveInitialUserId()) ?? true,
  )

  // Realinha a preferência quando o usuário do contexto muda (login/troca de conta).
  useEffect(() => {
    if (!userId) return
    setOpen(getSidebarPreference(userId) ?? true)
  }, [userId])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      setSidebarPreference(userId, next)
    },
    [userId],
  )

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange}>
      {/* Termina a restauração de rolagem que o roteador começa antes de a
          página ter altura. Fica aqui, e não numa página: vale para todas. */}
      <ScrollRestorationSettler />

      <MobileNavbar />
      <AppSidebar />
      <main className="flex min-h-screen flex-1 flex-col overflow-x-hidden pt-14 md:pt-0">
        {children}
      </main>
    </SidebarProvider>
  )
}

export default memo(MainLayoutComponent)
