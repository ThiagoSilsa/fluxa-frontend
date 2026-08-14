// Router
import { createFileRoute } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

// Shared
import { PagePlaceholder } from '#/shared/components/page-placeholder'

export const Route = createFileRoute('/_private/management/imports')({
  component: ImportsPage,
})

/**
 * Página de importações em lote.
 *
 * TODO: Implementar a tela real de importações.
 */
function ImportsPage() {
  const { t } = useTranslation('mainLayout')

  return <PagePlaceholder title={t('sidebar.items.imports')} />
}
