// Router
import { createFileRoute } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

// Shared
import { PagePlaceholder } from '#/shared/components/page-placeholder'

export const Route = createFileRoute('/_private/management/devices')({
  component: DevicesPage,
})

/**
 * Página de gestão de dispositivos.
 *
 * TODO: Implementar a tela real de dispositivos.
 */
function DevicesPage() {
  const { t } = useTranslation('mainLayout')

  return <PagePlaceholder title={t('sidebar.items.devices')} />
}
