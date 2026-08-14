// Router
import { createFileRoute } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_private/home')({
  component: HomePage,
})

/**
 * Página inicial (após o login).
 *
 * TODO: Implementar a tela inicial da aplicação (dashboard, atalhos, etc.).
 */
function HomePage() {
  const { t } = useTranslation('common')

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">{t('home.title')}</h1>
      <p className="text-muted-foreground">{t('home.description')}</p>
    </div>
  )
}
