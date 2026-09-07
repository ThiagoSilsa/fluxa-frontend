// i18n
import { useTranslation } from 'react-i18next'

// Router
import { Link } from '@tanstack/react-router'

// Shared (ui primitives)
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

/**
 * Página 404 (URL não encontrada).
 *
 * Renderizada pelo `notFoundComponent` da rota raiz (TanStack Router) quando
 * nenhuma rota casa com a URL. Leva o usuário de volta ao início (`/home` —
 * protegida pelo `AuthGuard`, que redireciona para o login quando necessário).
 *
 * Sem i18n de domínio: textos no namespace `common` (shared).
 */
export function NotFoundPage() {
  const { t } = useTranslation('common')

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
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
    </div>
  )
}
