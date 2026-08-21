// i18n
import { useTranslation } from 'react-i18next'

// Lib
import { getAccessRequestStatusLabelKey } from '../lib/access-request.lib'

// Types
import type { AccessRequestStatus } from '../types/access-requests.types'

// Shared
import { Badge } from '#/shared/components'

/** Cores do badge conforme o status. */
const STATUS_CLASS: Record<AccessRequestStatus, string> = {
  PENDING: 'border-amber-300 bg-amber-100 text-amber-800',
  IN_CONTACT: 'border-blue-300 bg-blue-100 text-blue-800',
  REGISTERED: 'border-emerald-300 bg-emerald-100 text-emerald-800',
  REJECTED: 'border-red-300 bg-red-100 text-red-800',
  CANCELLED: 'border-muted bg-muted text-muted-foreground',
}

/**
 * Badge de status de uma solicitação de acesso (cores por situação).
 */
export function AccessRequestStatusBadge({ status }: { status: AccessRequestStatus }) {
  const { t } = useTranslation('accessRequests')

  return (
    <Badge variant="outline" className={STATUS_CLASS[status]}>
      {t(getAccessRequestStatusLabelKey(status))}
    </Badge>
  )
}
