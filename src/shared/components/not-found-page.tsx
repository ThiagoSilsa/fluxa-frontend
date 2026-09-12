// i18n
import { useTranslation } from 'react-i18next'

// Router
import { Link } from '@tanstack/react-router'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

// Widgets
import MainLayout from '#/widgets/main-layout/components/main-layout'

// Shared (ui primitives)
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

/**
 * Página 404 (URL não encontrada).
 *
 * Renderizada pelo `notFoundComponent` da rota raiz (TanStack Router) quando
 * nenhuma rota casa com a URL — dentro do shell da aplicação, que é quem monta
 * o `AuthProvider`.
 *
 * O layout acompanha a sessão: **com sessão**, a página é composta dentro do
 * layout principal (sidebar e navegação preservadas — o usuário volta ao
 * trabalho pela própria navegação) e o CTA leva ao início (`/home`, protegida
 * pelo `AuthGuard`); **sem sessão**, é um cartão autônomo e centrado, sem
 * layout de aplicação. Enquanto a sessão não está pronta não se escolhe layout
 * (mesmo padrão do `AuthGuard`/`withRouteAccess`), para não piscar o cartão
 * público antes de montar a aplicação.
 *
 * Sem i18n de domínio: textos no namespace `common` (shared).
 */
export function NotFoundPage() {
  const { t } = useTranslation('common')
  const { isAuthenticated, isReady } = useAuth()

  if (!isReady) {
    return null
  }

  const card = (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <span className="text-muted-foreground text-7xl font-bold">404</span>
        <CardTitle>{t('notFound.title')}</CardTitle>
        <CardDescription>{t('notFound.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Link to="/home">
          <Button>{t('notFound.action')}</Button>
        </Link>
      </CardContent>
    </Card>
  )

  if (!isAuthenticated) {
    return <div className="flex min-h-screen w-full items-center justify-center px-4">{card}</div>
  }

  return (
    <MainLayout>
      <div className="flex flex-1 items-center justify-center px-4 py-10">{card}</div>
    </MainLayout>
  )
}
