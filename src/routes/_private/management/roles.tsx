// Router
import { createFileRoute } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

// Shared
import { PagePlaceholder } from '#/shared/components/page-placeholder'

export const Route = createFileRoute('/_private/management/roles')({
  component: RolesPage,
})

/**
 * Página de gestão de cargos e permissões.
 *
 * TODO: Implementar a tela real de cargos.
 */
function RolesPage() {
  const { t } = useTranslation('mainLayout')

  return <PagePlaceholder title={t('sidebar.items.roles')} />
}
