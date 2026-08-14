// Router
import { createFileRoute } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

// Shared
import { PagePlaceholder } from '#/shared/components/page-placeholder'

export const Route = createFileRoute('/_private/management/departments')({
  component: DepartmentsPage,
})

/**
 * Página de gestão de departamentos.
 *
 * TODO: Implementar a tela real de departamentos.
 */
function DepartmentsPage() {
  const { t } = useTranslation('mainLayout')

  return <PagePlaceholder title={t('sidebar.items.departments')} />
}
