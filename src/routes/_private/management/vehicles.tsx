// Router
import { createFileRoute } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

// Shared
import { PagePlaceholder } from '#/shared/components/page-placeholder'

export const Route = createFileRoute('/_private/management/vehicles')({
  component: VehiclesPage,
})

/**
 * Página de gestão de veículos.
 *
 * TODO: Implementar a tela real de veículos.
 */
function VehiclesPage() {
  const { t } = useTranslation('mainLayout')

  return <PagePlaceholder title={t('sidebar.items.vehicles')} />
}
