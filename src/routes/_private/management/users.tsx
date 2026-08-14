// Router
import { createFileRoute } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

// Shared
import { PagePlaceholder } from '#/shared/components/page-placeholder'

export const Route = createFileRoute('/_private/management/users')({
  component: UsersPage,
})

/**
 * Página de gestão de usuários.
 *
 * TODO: Implementar a tela real de usuários.
 */
function UsersPage() {
  const { t } = useTranslation('mainLayout')

  return <PagePlaceholder title={t('sidebar.items.users')} />
}
