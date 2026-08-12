// React
import type { ReactNode } from 'react'

// Router
import { Outlet } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

// UI
import { Button } from '#/shared/components/ui/button'

interface MainLayoutProps {
  children?: ReactNode
}

/**
 * Layout principal da aplicação (protegido por autenticação).
 *
 * TODO: Implementar o layout completo (menu lateral, barra superior, seletor
 * de empresa) quando a estrutura da aplicação for definida.
 */
export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth()
  const { t } = useTranslation('common')

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="font-semibold">Fluxa</span>
        <div className="flex items-center gap-4">
          {user && <span className="text-muted-foreground text-sm">{user.email}</span>}
          <Button type="button" variant="outline" size="sm" onClick={logout}>
            {t('actions.logout')}
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6">{children ?? <Outlet />}</main>
    </div>
  )
}
