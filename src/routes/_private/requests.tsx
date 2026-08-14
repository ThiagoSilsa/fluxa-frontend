// Router
import { createFileRoute } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

// Shared
import { PagePlaceholder } from '#/shared/components/page-placeholder'

export const Route = createFileRoute('/_private/requests')({
  component: RequestsPage,
})

/**
 * Página de solicitações (acesso e bloqueio).
 *
 * TODO: Implementar a tela real de solicitações.
 */
function RequestsPage() {
  const { t } = useTranslation('mainLayout')

  return <PagePlaceholder title={t('sidebar.items.requests')} />
}
